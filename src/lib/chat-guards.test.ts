import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_MESSAGES,
  MAX_INPUT_CHARS,
  MAX_MESSAGES_PER_SESSION,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  checkRateLimit,
  truncateHistory,
  validateChatMessages,
} from "@/lib/chat-guards";

const userMsg = (text: string) => ({
  id: "x",
  role: "user",
  parts: [{ type: "text", text }],
});
const assistantMsg = (text: string) => ({
  id: "y",
  role: "assistant",
  parts: [{ type: "text", text }],
});

describe("validateChatMessages", () => {
  it("accepts a normal conversation", () => {
    expect(validateChatMessages([userMsg("hi")])).toEqual({ ok: true });
  });

  it("rejects non-arrays", () => {
    const r = validateChatMessages("nope");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("rejects an empty array", () => {
    const r = validateChatMessages([]);
    expect(r.ok).toBe(false);
  });

  it("rejects malformed message objects", () => {
    const r = validateChatMessages([{ role: "user" }]);
    expect(r.ok).toBe(false);
  });

  it("rejects user text over MAX_INPUT_CHARS", () => {
    const r = validateChatMessages([userMsg("a".repeat(MAX_INPUT_CHARS + 1))]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("allows user text at exactly MAX_INPUT_CHARS", () => {
    expect(
      validateChatMessages([userMsg("a".repeat(MAX_INPUT_CHARS))]),
    ).toEqual({ ok: true });
  });

  it("rejects sessions with more than MAX_MESSAGES_PER_SESSION user messages", () => {
    const msgs = Array.from(
      { length: MAX_MESSAGES_PER_SESSION + 1 },
      (_, i) => userMsg(`m${i}`),
    );
    const r = validateChatMessages(msgs);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("does not count assistant messages toward the session cap", () => {
    const msgs = [
      ...Array.from({ length: MAX_MESSAGES_PER_SESSION - 1 }, (_, i) =>
        userMsg(`m${i}`),
      ),
      assistantMsg("reply"),
      userMsg("last"),
    ];
    expect(validateChatMessages(msgs)).toEqual({ ok: true });
  });
});

describe("truncateHistory", () => {
  it("keeps the last MAX_HISTORY_MESSAGES messages", () => {
    const msgs = Array.from({ length: 20 }, (_, i) => userMsg(`m${i}`));
    const out = truncateHistory(msgs);
    expect(out).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(out[out.length - 1]).toBe(msgs[19]);
  });

  it("returns short histories unchanged", () => {
    const msgs = [userMsg("a"), assistantMsg("b")];
    expect(truncateHistory(msgs)).toEqual(msgs);
  });
});

describe("checkRateLimit", () => {
  it("allows up to RATE_LIMIT_MAX requests then blocks", () => {
    const store = new Map<string, { count: number; windowStart: number }>();
    const now = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(checkRateLimit("1.2.3.4", now, store)).toBe(true);
    }
    expect(checkRateLimit("1.2.3.4", now, store)).toBe(false);
  });

  it("resets after the window elapses", () => {
    const store = new Map<string, { count: number; windowStart: number }>();
    const now = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("ip", now, store);
    expect(checkRateLimit("ip", now, store)).toBe(false);
    expect(checkRateLimit("ip", now + RATE_LIMIT_WINDOW_MS + 1, store)).toBe(
      true,
    );
  });

  it("tracks IPs independently", () => {
    const store = new Map<string, { count: number; windowStart: number }>();
    const now = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("a", now, store);
    expect(checkRateLimit("a", now, store)).toBe(false);
    expect(checkRateLimit("b", now, store)).toBe(true);
  });
});
