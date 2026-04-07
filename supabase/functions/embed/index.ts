import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
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

    const { note_id } = await req.json();
    if (!note_id) {
      return new Response(JSON.stringify({ error: "note_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch note content
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, title, content, user_id")
      .eq("id", note_id)
      .single();

    if (noteError || !note) {
      return new Response(JSON.stringify({ error: "Note not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Security: user can only embed their own notes
    if (note.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const textToEmbed = `${note.title}\n\n${note.content}`.substring(0, 3000);

    // Try Vertex-key first (OpenAI-compatible), then Gemini direct
    let embedding: number[] | null = null;

    try {
      // Try OpenAI-compatible embedding via Vertex-key
      const openAiRes = await fetch(`${VERTEX_KEY_URL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${VERTEX_KEY_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: textToEmbed,
        }),
      });

      if (openAiRes.ok) {
        const openAiData = await openAiRes.json();
        if (openAiData.data?.[0]?.embedding) {
          embedding = openAiData.data[0].embedding;
        }
      }
    } catch {}

    // Fallback: Gemini direct embedding
    if (!embedding && GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: { parts: [{ text: textToEmbed }] },
            }),
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          if (geminiData.embedding?.values) {
            embedding = geminiData.embedding.values;
          }
        }
      } catch {}
    }

    if (!embedding || embedding.length === 0) {
      return new Response(JSON.stringify({ error: "Embedding failed — no API keys configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update note with embedding
    const { error: updateError } = await supabase
      .from("notes")
      .update({ embedding })
      .eq("id", note_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to save embedding", detail: updateError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      dimensions: embedding.length,
      note_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
