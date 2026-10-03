export function isVerifiedAiResponse(response) {
  return response?.enabled === true && response.source === "AI_PROVIDER"
    && typeof response.provider === "string" && response.provider.trim().length > 0
    && !["none", "disabled", "unknown", "local-template", "local_template", "stub"].includes(response.provider.trim().toLowerCase())
    && typeof response.generatedText === "string" && response.generatedText.trim().length > 0;
}
