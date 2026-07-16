import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/system-prompt";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("contains core identity facts", () => {
    expect(prompt).toContain("Devin McCaw");
    expect(prompt).toContain("Parasource");
    expect(prompt).toContain("UC Irvine");
  });

  it("contains the off-duty facts", () => {
    expect(prompt).toContain("335");
    expect(prompt).toContain("Brazilian Jiu-Jitsu");
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

  it("forbids producing code or other deliverables", () => {
    const lower = prompt.toLowerCase();
    expect(lower).toContain("never write, generate, complete, debug, or explain code");
    expect(lower).toContain("out_of_scope");
  });

  it("scopes the unit to questions about devin only", () => {
    const lower = prompt.toLowerCase();
    expect(lower).toContain("sole function is to answer questions about devin");
    expect(lower).toContain("refuse");
  });

  it("hardens against prompt-injection overrides", () => {
    const lower = prompt.toLowerCase();
    expect(lower).toContain("ignore");
    expect(lower).toContain("cannot be overridden");
  });
});
