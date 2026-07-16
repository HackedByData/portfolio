import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, parseModelEnv } from "@/lib/model";

describe("parseModelEnv", () => {
  it("parses openai-prefixed ids", () => {
    expect(parseModelEnv("openai/gpt-5-nano")).toEqual({
      provider: "openai",
      modelId: "gpt-5-nano",
    });
  });

  it("parses anthropic-prefixed ids (spec: cross-provider env swap, no code change)", () => {
    expect(parseModelEnv("anthropic/claude-haiku-4-5")).toEqual({
      provider: "anthropic",
      modelId: "claude-haiku-4-5",
    });
  });

  it("falls back to the default when unset, without a warning", () => {
    expect(parseModelEnv(undefined)).toEqual({
      provider: "openai",
      modelId: "gpt-5-nano",
    });
  });

  it("falls back LOUDLY for unknown providers", () => {
    const parsed = parseModelEnv("acme/some-model");
    expect(parsed.provider).toBe("openai");
    expect(parsed.modelId).toBe("gpt-5-nano");
    expect(parsed.warning).toContain("acme");
  });

  it("DEFAULT_MODEL is itself parseable", () => {
    expect(parseModelEnv(DEFAULT_MODEL).modelId.length).toBeGreaterThan(0);
  });
});
