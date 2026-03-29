import Anthropic from "@anthropic-ai/sdk";

// Allow graceful degradation when Anthropic is not configured
let anthropic: Anthropic | null = null;

const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey) {
  anthropic = new Anthropic({ apiKey });
  console.log("[Integrations] ✅ Anthropic Claude configured");
} else {
  console.warn("[Integrations] ANTHROPIC_API_KEY not set - AI features will use built-in fallback responses");
}

export { anthropic };
