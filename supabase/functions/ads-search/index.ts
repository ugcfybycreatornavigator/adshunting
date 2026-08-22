// @ts-expect-error Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyClerkToken } from "../_shared/clerk.ts";
import { AdsProviderOrchestrator } from "../_shared/ads/orchestrator.ts";
import { ProviderError } from "../_shared/ads/providers/errors.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    try {
      await verifyClerkToken(req, token);
    } catch (e: unknown) {
      return new Response(JSON.stringify({ error: "Unauthorized", detail: (e as Error).message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let filters = {};
    try {
      filters = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orchestrator = new AdsProviderOrchestrator();
    const result = await orchestrator.search(filters);

    console.log(JSON.stringify({
      event: "ads_provider_request",
      provider: result.providerMeta?.provider,
      fallbackUsed: result.providerMeta?.fallbackUsed,
      fallbackReason: result.providerMeta?.fallbackReason,
      result_count: result.ads.length
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("AdsSearch Function Error:", error);
    
    if (error instanceof ProviderError) {
      return new Response(JSON.stringify({ success: false, code: error.code, message: error.message }), {
        status: error.status || 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, code: "SEARCH_UNAVAILABLE", message: "Search is temporarily unavailable." }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
