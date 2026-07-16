/**
 * Classifies chat transport errors surfaced by `useChat`'s `onError`.
 *
 * The AI SDK v7 `DefaultChatTransport` surfaces the HTTP error response
 * body (see `src/app/api/chat/route.ts`'s `jsonError`, e.g.
 * `{"error":"UNIT_RESTING"}`) as the thrown error's `message`. We match on
 * the presence of our route's error codes anywhere in that string so this
 * keeps working whether the transport hands us the bare code or the full
 * JSON body text. Anything we don't recognize is treated as transient.
 */
export type ChatErrorKind =
  | "resting"
  | "rate-limited"
  | "session-limit"
  | "transient";

export function classifyChatError(message: string): { kind: ChatErrorKind } {
  if (message.includes("UNIT_RESTING")) return { kind: "resting" };
  if (message.includes("RATE_LIMITED")) return { kind: "rate-limited" };
  if (message.includes("SESSION_LIMIT")) return { kind: "session-limit" };
  return { kind: "transient" };
}
