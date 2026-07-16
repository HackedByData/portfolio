import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/chat/route";

function chatRequest(body: unknown, ip = "9.9.9.9"): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const userMsg = (text: string) => ({
  id: "1",
  role: "user",
  parts: [{ type: "text", text }],
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/chat guards", () => {
  it("returns 503 UNIT_RESTING when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const res = await POST(chatRequest({ messages: [userMsg("hi")] }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "UNIT_RESTING" });
  });

  it("returns 400 on unparseable JSON", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const res = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 on malformed messages", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const res = await POST(chatRequest({ messages: [{ bogus: true }] }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "MALFORMED_TRANSMISSION" });
  });

  it("returns 400 SESSION_LIMIT past the message cap", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const msgs = Array.from({ length: 16 }, (_, i) => userMsg(`m${i}`));
    const res = await POST(chatRequest({ messages: msgs }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "SESSION_LIMIT" });
  });

  it("returns 429 RATE_LIMITED after too many requests from one IP", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    // Malformed bodies still consume rate budget? No — rate check runs after
    // validation, so hammer with SESSION_LIMIT payloads (still pre-model).
    // Use a dedicated IP so other tests aren't affected.
    const msgs = Array.from({ length: 16 }, (_, i) => userMsg(`m${i}`));
    let last = 400;
    for (let i = 0; i < 30; i++) {
      const res = await POST(chatRequest({ messages: msgs }, "7.7.7.7"));
      last = res.status;
      if (last === 429) break;
    }
    expect(last).toBe(429);
  });
});
