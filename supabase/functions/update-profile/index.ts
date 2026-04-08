import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // Verify auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return json({ error: "Invalid token" }, 401);
    }

    const body = await req.json();
    const { display_name, usage_goals, onboarding_completed } = body;

    // Build update payload — only allowed fields
    const updates: Record<string, unknown> = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (usage_goals !== undefined) updates.usage_goals = usage_goals;
    if (onboarding_completed !== undefined) updates.onboarding_completed = onboarding_completed;

    if (Object.keys(updates).length === 0) {
      return json({ error: "No fields to update" }, 400);
    }

    // Update profile using service role (bypasses RLS)
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("[update-profile] Error:", updateError);
      return json({ error: "Update failed", detail: updateError.message }, 500);
    }

    return json({ success: true, profile: updated }, 200);
  } catch (err) {
    console.error("[update-profile] Unexpected error:", err);
    return json({ error: "Internal server error", detail: String(err) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
