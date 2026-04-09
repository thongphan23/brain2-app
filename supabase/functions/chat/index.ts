import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERTEX_KEY_URL = "https://vertex-key.com/api/v1";
const VERTEX_KEY_API_KEY = Deno.env.get("VERTEX_KEY_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const GLOBAL_RULES_PREFIX = `You are BRAIN2 — the user's Second Brain.
Core philosophy: "AI amplifies you. The question is, what do you have to amplify?"
You DO NOT replace thinking. You AMPLIFY thinking.

=== 7 IMMUTABLE LAWS ===

1. DEFAULT LANGUAGE: Vietnamese.
   - English terms -> ALWAYS include brief Vietnamese explanation in parentheses.
   - If user writes English -> reply in English.
   - If user mixes -> reply Vietnamese, keep English terms when needed.

2. DEPTH OVER SPEED: Prioritize DEEP over FAST.
   - NO surface-level answers. Even for simple questions, add 1 layer of insight.
   - 1 deep insight > 10 shallow bullet points.
   - When analyzing: always find ROOT CAUSE, don't stop at symptoms.

3. VAULT-FIRST: When vault context is available:
   - MUST cross-reference: "This concept relates to [note X] in your vault."
   - Suggest new connections between existing notes.
   - Highlight knowledge gaps.
   - When NO vault context: ask personalizing questions BEFORE giving generic answers.

4. ANTI-GENERIC: Absolutely NO vanilla ChatGPT output.
   - DON'T start with "Sure!", "Of course!", "Certainly!".
   - DON'T end with "Hope this helps!", "Let me know if you need anything!".
   - START with the most surprising insight or an unlocking question.
   - END with: (a) Open question, (b) Specific action suggestion, or (c) Vault save suggestion.

5. FRIENDLY MENTOR VOICE:
   - Talk like a trusted mentor with real experience.
   - Use "minh" (Brain2), call user "ban".
   - Use everyday Vietnamese examples.

6. PROACTIVE KNOWLEDGE CAPTURE:
   - When detecting a noteworthy insight -> suggest: "This insight is worth saving to vault."
   - DON'T spam. Only suggest when truly long-term valuable.

7. ALWAYS ACTIONABLE:
   - Every response must have AT LEAST 1 specific action item.

=== TOOL-SPECIFIC INSTRUCTIONS ===
`;

const MODELS: Record<string, { vertexId: string; name: string; maxTokens: number; costPer1kInput: number; costPer1kOutput: number; fallbacks: string[] }> = {
  // FREE models — PRIMARY for free tier
  "free/qwen3-235b": { vertexId: "free/qwen3-235b", name: "Qwen3 235B (Free)", maxTokens: 8192, costPer1kInput: 0, costPer1kOutput: 0, fallbacks: ["free/Claude-v3.2", "free/kimi-k2", "free/qwen3-max"] },
  "free/Claude-v3.2": { vertexId: "free/Claude-v3.2", name: "Claude V3.2 (Free)", maxTokens: 8192, costPer1kInput: 0, costPer1kOutput: 0, fallbacks: ["free/qwen3-235b", "free/kimi-k2"] },
  "free/kimi-k2": { vertexId: "free/kimi-k2", name: "Kimi K2 (Free)", maxTokens: 8192, costPer1kInput: 0, costPer1kOutput: 0, fallbacks: ["free/qwen3-235b", "free/Claude-v3.2"] },
  "free/qwen3-max": { vertexId: "free/qwen3-max", name: "Qwen3 Max (Free)", maxTokens: 8192, costPer1kInput: 0, costPer1kOutput: 0, fallbacks: ["free/qwen3-235b", "free/Claude-v3.2"] },
  // PAID models — need balance, fallback to free if fail
  "gemini-2.5-flash": { vertexId: "gemini-2.5-flash-chat", name: "Gemini 2.5 Flash", maxTokens: 8192, costPer1kInput: 0.00015, costPer1kOutput: 0.0006, fallbacks: ["free/qwen3-235b", "free/Claude-v3.2"] },
  "gemini-2.5-pro": { vertexId: "gemini-2.5-pro-chat", name: "Gemini 2.5 Pro", maxTokens: 8192, costPer1kInput: 0.00125, costPer1kOutput: 0.01, fallbacks: ["gemini-2.5-flash", "free/qwen3-235b"] },
  "gemini-3-flash": { vertexId: "gemini-3-flash-preview-chat", name: "Gemini 3 Flash", maxTokens: 8192, costPer1kInput: 0.0002, costPer1kOutput: 0.0008, fallbacks: ["gemini-2.5-flash", "free/qwen3-235b"] },
  "gemini-3-pro": { vertexId: "gemini-3-pro-preview-chat", name: "Gemini 3 Pro", maxTokens: 8192, costPer1kInput: 0.002, costPer1kOutput: 0.015, fallbacks: ["gemini-2.5-flash", "free/qwen3-235b"] },
  "prx/claude-sonnet-4-6": { vertexId: "prx/claude-sonnet-4-6", name: "Claude Sonnet 4.6", maxTokens: 4096, costPer1kInput: 0.003, costPer1kOutput: 0.015, fallbacks: ["free/qwen3-235b"] },
  "prx/claude-haiku-4-5": { vertexId: "prx/claude-haiku-4-5", name: "Claude Haiku 4.5", maxTokens: 4096, costPer1kInput: 0.001, costPer1kOutput: 0.005, fallbacks: ["free/qwen3-235b"] },
  "prx/claude-opus-4-6": { vertexId: "prx/claude-opus-4-6", name: "Claude Opus 4.6", maxTokens: 4096, costPer1kInput: 0.005, costPer1kOutput: 0.025, fallbacks: ["free/qwen3-235b"] },
  "gpt-4o": { vertexId: "pro/gpt-4o", name: "GPT-4o", maxTokens: 4096, costPer1kInput: 0.0025, costPer1kOutput: 0.01, fallbacks: ["free/qwen3-235b"] },
  "gpt-5.2": { vertexId: "pro/gpt-5.2", name: "GPT-5.2", maxTokens: 8192, costPer1kInput: 0.005, costPer1kOutput: 0.025, fallbacks: ["free/qwen3-235b"] },
  "grok-4": { vertexId: "xai/grok-4", name: "Grok 4", maxTokens: 8192, costPer1kInput: 0.005, costPer1kOutput: 0.025, fallbacks: ["free/qwen3-235b"] },
  // Alias for backwards compatibility
  "Claude-r1": { vertexId: "free/Claude-r1", name: "Claude R1 (Free)", maxTokens: 8192, costPer1kInput: 0, costPer1kOutput: 0, fallbacks: ["free/qwen3-235b"] },
};

interface ChatRequest {
  conversation_id?: string;
  tool_slug: string;
  message: string;
  model?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    return new Response(JSON.stringify({
      status: "ok", version: 28,
      features: ["global-rules", "vault-context", "streaming", "user-id-fix", "multi-model-fallback"],
      models: Object.entries(MODELS).map(([id, m]) => ({ id, name: m.name })),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

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

    const body: ChatRequest = await req.json();
    const { tool_slug, message, conversation_id } = body;
    let modelKey = body.model && MODELS[body.model] ? body.model : "free/qwen3-235b";

    if (!tool_slug || !message) {
      return new Response(JSON.stringify({ error: "tool_slug and message required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit
    let rateCheck: any = null;
    try {
      const { data, error: rateError } = await supabase.rpc("check_rate_limit", { p_user_id: user.id });
      if (!rateError && data) {
        rateCheck = data;
        if (!rateCheck.allowed) {
          return new Response(JSON.stringify({
            error: "rate_limited",
            message: rateCheck.reason === "daily_limit"
              ? "Ban da dung het " + rateCheck.limit + " tin nhan hom nay. Nang cap goi Pro de co 200 msg/ngay."
              : "Da dat gioi han su dung. Vui long thu lai sau.",
            tier: rateCheck.tier,
          }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (rateCheck.allowed_models && !rateCheck.allowed_models.includes(modelKey)) modelKey = "free/qwen3-235b";
      }
    } catch {}

    // Tool prompt
    let toolPrompt = "Ban la Brain2, tro ly AI giup nguoi dung tu duy sau hon.";
    try {
      const { data: tool } = await supabase.from("cognitive_tools").select("system_prompt, name").eq("slug", tool_slug).eq("is_active", true).single();
      if (tool?.system_prompt) toolPrompt = tool.system_prompt;
    } catch {}

    const systemPrompt = GLOBAL_RULES_PREFIX + toolPrompt;

    // Conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conv, error: convError } = await supabase.from("conversations")
        .insert({ user_id: user.id, tool_slug, title: message.substring(0, 100) })
        .select("id").single();
      if (convError) return new Response(JSON.stringify({ error: "Conv failed", detail: convError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      convId = conv.id;
    }

    // History
    const { data: history } = await supabase.from("messages").select("role, content").eq("conversation_id", convId).order("created_at", { ascending: true }).limit(20);

    // Vault context (RAG)
    let vaultContext = "";
    try {
      // @ts-ignore
      const aiSession = new Supabase.ai.Session('gte-small');
      const rawEmbedding = await aiSession.run(message.substring(0, 2000), { mean_pool: true, normalize: true });
      const embedding = Array.from(rawEmbedding.data || rawEmbedding);
      
      if (embedding && embedding.length > 0) {
        const { data: relevantNotes, error: searchError } = await supabase.rpc("search_notes", {
          query_embedding: embedding, match_threshold: 0.5, match_count: 5, p_user_id: user.id,
        });
        
        if (relevantNotes && relevantNotes.length > 0) {
          vaultContext = "\n\n--- CONTEXT FROM YOUR VAULT ---\n" +
            relevantNotes.map((n: any) => `## ${n.title}\n${n.content}`).join("\n\n");
        }
      }
    } catch (e) { console.error("RAG logic error:", e); }

    const messages = [
      { role: "system", content: systemPrompt + vaultContext },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    // FIX BUG-C1: Save user msg WITH user_id
    await supabase.from("messages").insert({
      conversation_id: convId,
      user_id: user.id,
      role: "user",
      content: message,
      model_used: modelKey,
    });

    // AI call — try primary model, then each fallback in order
    const callWithFallback = async (primaryKey: string, fallbacks: string[]): Promise<{ response: Response; usedModel: string } | null> => {
      const allModelKeys = [primaryKey, ...fallbacks].filter(k => MODELS[k])
      for (const mk of allModelKeys) {
        const mc = MODELS[mk]
        try {
          const res = await fetch(`${VERTEX_KEY_URL}/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${VERTEX_KEY_API_KEY}` },
            body: JSON.stringify({ model: mc.vertexId, messages, stream: true, max_tokens: mc.maxTokens, temperature: 0.7 }),
          });
          if (res.ok) return { response: res, usedModel: mk }
          // 402 (balance), 406 (upstream), 503 (service) → try next
          if (res.status === 402 || res.status === 406 || res.status === 503) continue
          // Other errors → stop (not retriable)
          return { response: res, usedModel: mk }
        } catch { continue }
      }
      return null // All failed
    };

    const modelConfig = MODELS[modelKey] || MODELS["free/qwen3-235b"]
    const result = await callWithFallback(modelKey, modelConfig.fallbacks)

    if (!result) {
      return new Response(JSON.stringify({ error: "service_unavailable", message: "Tất cả models AI đều tạm thời không khả dụng. Vui lòng thử lại sau vài phút." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = result.response
    const usedModel = result.usedModel

    // Stream
    const reader = aiResponse.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const json = JSON.parse(line.slice(6));
                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) fullText += delta;
                } catch {}
              }
            }
          }
        } finally {
          if (fullText) {
            const inputTokens = Math.ceil(message.length / 4);
            const outputTokens = Math.ceil(fullText.length / 4);
            const mc = MODELS[usedModel];
            const estimatedCost = (inputTokens / 1000) * (mc?.costPer1kInput || 0) + (outputTokens / 1000) * (mc?.costPer1kOutput || 0);

            // FIX BUG-C1: Save assistant msg WITH user_id
            await supabase.from("messages").insert({
              conversation_id: convId,
              user_id: user.id,
              role: "assistant",
              content: fullText,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              model_used: usedModel,
              metadata: { model: usedModel, vertex_model: mc?.vertexId || usedModel, estimated_cost: estimatedCost },
            });
            // FIX BUG-C4: update last_message_at
            await supabase.from("conversations").update({
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }).eq("id", convId);
            try { await supabase.rpc("increment_usage", { p_user_id: user.id, p_input_tokens: inputTokens, p_output_tokens: outputTokens, p_cost_usd: estimatedCost }); } catch {}
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Conversation-Id": convId!,
        "X-Model-Used": modelKey,
        "X-User-Tier": rateCheck?.tier || "free",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
