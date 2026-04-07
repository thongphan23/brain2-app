import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Domain keywords for auto-detection
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  "Tư duy & Nhận thức": ["tư duy", "mindset", "nhận thức", "cognitive", "suy nghĩ", "perception"],
  "Kinh doanh": ["kinh doanh", "business", "doanh nghiệp", "marketing", "sale", "revenue", "strategy"],
  "Sáng tạo": ["sáng tạo", "creative", "idea", "innovation", "brainstorm", "concept"],
  "Công nghệ": ["công nghệ", "tech", "AI", "software", "code", "programming", "tool"],
  "Tài chính": ["tài chính", "finance", "đầu tư", "invest", "money", "tiền", "income"],
  "Marketing": ["marketing", "content", "branding", "facebook", "tiktok", "youtube", "quảng cáo"],
  "Giáo dục": ["học", "education", "learning", "knowledge", "kiến thức", "course", "khóa học"],
  "Sức khỏe": ["sức khỏe", "health", "thể chất", "fitness", "wellness", "lối sống"],
  "Tâm lý": ["tâm lý", "psychology", "hành vi", "behavior", "cảm xúc", "emotion"],
  "Sách": ["sách", "book", "reading", "đọc", "author", "tác giả"],
  "Podcast": ["podcast", "nghe", "audio", "radio", "interview"],
  "Coaching": ["coaching", "mentor", "cố vấn", "hướng dẫn", "phát triển"],
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

    // Fetch all user's notes
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("id, domain, note_type, maturity, content, title")
      .eq("user_id", user.id);

    if (notesError) {
      return new Response(JSON.stringify({ error: "Failed to fetch notes" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalNotes = notes?.length || 0;

    // Aggregate by domain
    const domainCounts: Record<string, number> = {};
    for (const note of notes || []) {
      const domain = note.domain || "Khác";
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }

    // Auto-detect domains from content if not explicitly set
    const domainScores: { domain: string; score: number }[] = [];
    const maxDomainCount = Math.max(...Object.values(domainCounts), 1);

    for (const [domain, count] of Object.entries(domainCounts)) {
      const score = domain === "Khác" ? 0 : count / maxDomainCount;
      domainScores.push({ domain, score: Math.round(score * 100) / 100 });
    }

    // Also detect from content keywords
    for (const note of notes || []) {
      if (note.domain && note.domain !== "Khác") continue;
      const text = `${note.title} ${note.content}`.toLowerCase();
      for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        const matched = keywords.filter(k => text.includes(k)).length;
        if (matched >= 2) {
          domainCounts[domain] = (domainCounts[domain] || 0) + matched * 0.5;
        }
      }
    }

    // Sort domains by count
    domainScores.sort((a, b) => b.score - a.score);

    // Aggregate by maturity
    const maturityDist: Record<string, number> = { seed: 0, growing: 0, permanent: 0 };
    for (const note of notes || []) {
      const m = note.maturity || "seed";
      maturityDist[m] = (maturityDist[m] || 0) + 1;
    }

    // Aggregate by note type
    const noteTypeDist: Record<string, number> = {};
    for (const note of notes || []) {
      const t = note.note_type || "concept";
      noteTypeDist[t] = (noteTypeDist[t] || 0) + 1;
    }

    // Calculate overall score (weighted sum)
    const maturityWeights = { seed: 1, growing: 2, permanent: 3 };
    let weightedSum = 0;
    for (const note of notes || []) {
      const m = note.maturity || "seed";
      weightedSum += maturityWeights[m as keyof typeof maturityWeights] || 1;
    }
    const overallScore = totalNotes > 0 ? Math.round((weightedSum / (totalNotes * 3)) * 100) / 100 : 0;

    // Get suggested domains (top domains user doesn't have many notes in)
    const allDomains = Object.keys(DOMAIN_KEYWORDS);
    const suggestedDomains = allDomains
      .filter(d => !(d in domainCounts))
      .slice(0, 3);

    // Fetch connections count
    const { count: connectionsCount } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      total_notes: totalNotes,
      total_connections: connectionsCount || 0,
      domain_scores: domainScores.slice(0, 10),
      maturity_distribution: maturityDist,
      note_type_distribution: noteTypeDist,
      overall_score: overallScore,
      suggested_domains: suggestedDomains,
      radar_data: {
        labels: domainScores.slice(0, 8).map(d => d.domain),
        values: domainScores.slice(0, 8).map(d => d.score),
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
