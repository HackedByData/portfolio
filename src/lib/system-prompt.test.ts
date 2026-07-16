import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/system-prompt";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("contains core identity facts", () => {
    expect(prompt).toContain("Devin McCaw");
    expect(prompt).toContain("Parasource");
    expect(prompt).toContain("UC Irvine");
  });

  it("contains the sales benchmarks", () => {
    expect(prompt).toContain("802");
    expect(prompt).toContain("150–200%");
  });

  it("never contains a phone number", () => {
    expect(prompt).not.toMatch(/\d{3}[)\s.-]*\d{3}[\s.-]*\d{4}/);
  });

  it("instructs the model to stay grounded", () => {
    expect(prompt.toLowerCase()).toContain("never invent");
  });
});
