export const DEFAULT_MODEL = "openai/gpt-5-nano";

export type ParsedModel = {
  provider: "openai" | "anthropic";
  modelId: string;
  warning?: string;
};

/**
 * Parse the AI_MODEL env var ("provider/model-id"). Both openai and anthropic
 * are wired so the cross-provider swap promised by the spec is truly env-only.
 * Unknown providers fall back to the default LOUDLY (route logs the warning)
 * rather than crashing the site or silently ignoring the config.
 */
export function parseModelEnv(value: string | undefined): ParsedModel {
  const fallback: ParsedModel = { provider: "openai", modelId: "gpt-5-nano" };
  if (!value) return fallback;
  const slash = value.indexOf("/");
  const provider = slash === -1 ? "" : value.slice(0, slash);
  const modelId = slash === -1 ? "" : value.slice(slash + 1);
  if ((provider === "openai" || provider === "anthropic") && modelId.length > 0) {
    return { provider, modelId };
  }
  return {
    ...fallback,
    warning: `AI_MODEL "${value}" not recognized (provider "${provider || "?"}"); falling back to ${DEFAULT_MODEL}`,
  };
}
