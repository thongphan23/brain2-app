import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VERTEX_KEY_API_KEY = Deno.env.get("VERTEX_KEY_API_KEY")!;
const VERTEX_KEY_URL = "https://vertex-key.com/api/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { query, limit = 10 } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query string required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchText = query.substring(0, 2000);

    // Step 1: Try semantic search via Vertex-key embedding
    let semanticResults: any[] = [];
    try {
      const embedRes = await fetch(`${VERTEX_KEY_URL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${VERTEX_KEY_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: searchText,
        }),
      });

      if (embedRes.ok) {
        const embedData = await embedRes.json();
        const embedding = embedData.data?.[0]?.embedding;

        if (embedding && embedding.length > 0) {
          // pgvector similarity search
          const { data: semantic } = await supabase.rpc("search_notes", {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: Math.min(limit, 20),
            p_user_id: user.id,
          });
          if (semantic) semanticResults = semantic;
        }
      }
    } catch (e) {
      console.error("Semantic search error:", e);
    }

    // Step 2: Keyword search (title + content LIKE)
    const { data: keywordResults } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .or(`title.ilike.%${searchText}%,content.ilike.%${searchText}%`)
      .limit(Math.min(limit, 20));

    // Step 3: Merge & deduplicate, rank by score
    const seen = new Set<string>();
    const merged: { note: any; semantic_score: number | null; keyword_score: number }[] = [];

    // Add semantic results first (higher quality)
    for (const item of semanticResults) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push({ note: item, semantic_score: item.similarity || null, keyword_score: 0 });
      }
    }

    // Add keyword results
    for (const note of (keywordResults || [])) {
      if (!seen.has(note.id)) {
        seen.add(note.id);
        merged.push({ note, semantic_score: null, keyword_score: 1 });
      }
    }

    // Sort: semantic first (by similarity desc), then keyword
    merged.sort((a, b) => {
      if (a.semantic_score !== null && b.semantic_score !== null) {
        return b.semantic_score - a.semantic_score;
      }
      if (a.semantic_score !== null) return -1;
      if (b.semantic_score !== null) return 1;
      return b.keyword_score - a.keyword_score;
    });

    const finalNotes = merged.slice(0, limit).map(m => m.note);

    return new Response(JSON.stringify({
      notes: finalNotes,
      total: finalNotes.length,
      query: searchText,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
