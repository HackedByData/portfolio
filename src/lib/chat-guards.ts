export const MAX_MESSAGES_PER_SESSION = 15;
export const MAX_INPUT_CHARS = 500;
export const MAX_HISTORY_MESSAGES = 8;
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export type GuardResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

type LooseMessage = {
  role?: unknown;
  parts?: unknown;
};

function textOf(message: LooseMessage): string {
  if (!Array.isArray(message.parts)) return "";
  return message.parts
    .filter(
      (p): p is { type: string; text: string } =>
        typeof p === "object" &&
        p !== null &&
        (p as { type?: unknown }).type === "text" &&
        typeof (p as { text?: unknown }).text === "string",
    )
    .map((p) => p.text)
    .join("");
}

export function validateChatMessages(messages: unknown): GuardResult {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
  }
  let userCount = 0;
  for (const m of messages) {
    if (typeof m !== "object" || m === null) {
      return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
    }
    const msg = m as LooseMessage;
    if (msg.role !== "user" && msg.role !== "assistant") {
      return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
    }
    if (!Array.isArray(msg.parts)) {
      return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
    }
    if (msg.role === "user") {
      userCount++;
      if (textOf(msg).length > MAX_INPUT_CHARS) {
        return { ok: false, status: 400, error: "INPUT_TOO_LONG" };
      }
    }
  }
  if (userCount > MAX_MESSAGES_PER_SESSION) {
    return { ok: false, status: 400, error: "SESSION_LIMIT" };
  }
  return { ok: true };
}

export function truncateHistory<T>(messages: T[]): T[] {
  return messages.slice(-MAX_HISTORY_MESSAGES);
}

const defaultStore = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(
  ip: string,
  now: number = Date.now(),
  store: Map<string, { count: number; windowStart: number }> = defaultStore,
): boolean {
  // prune occasionally so the map can't grow unbounded
  if (store.size > 500) {
    for (const [key, entry] of store) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) store.delete(key);
    }
  }
  const entry = store.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}
