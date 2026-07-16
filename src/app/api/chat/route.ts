import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import {
  createOpenAI,
  type OpenAIResponsesProviderOptions,
} from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import {
  checkRateLimit,
  truncateHistory,
  validateChatMessages,
} from "@/lib/chat-guards";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { parseModelEnv } from "@/lib/model";

export const maxDuration = 30;

const SYSTEM_PROMPT = buildSystemPrompt();

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

export async function POST(req: Request) {
  // 1. Resolve model + the ACTIVE provider's key. A keyless deploy must
  //    always degrade to scripted mode (503), never crash.
  const parsed = parseModelEnv(process.env.AI_MODEL);
  if (parsed.warning) console.warn("[chat]", parsed.warning);
  const apiKey =
    parsed.provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError(503, "UNIT_RESTING");
  }

  // 2. Rate limit per IP (first hop of x-forwarded-for on Vercel).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return jsonError(429, "RATE_LIMITED");
  }

  // 3. Parse + validate.
  let messages: UIMessage[];
  try {
    const body = (await req.json()) as { messages?: unknown };
    const result = validateChatMessages(body.messages);
    if (!result.ok) return jsonError(result.status, result.error);
    messages = body.messages as UIMessage[];
  } catch {
    return jsonError(400, "MALFORMED_TRANSMISSION");
  }

  // 4. Stream from the model chosen by AI_MODEL (openai or anthropic).
  const model =
    parsed.provider === "anthropic"
      ? createAnthropic({ apiKey })(parsed.modelId)
      : createOpenAI({ apiKey })(parsed.modelId);

  const result = streamText({
    model,
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(truncateHistory(messages)),
    maxOutputTokens: 300,
    ...(parsed.provider === "openai" && parsed.modelId.startsWith("gpt-5")
      ? {
          providerOptions: {
            openai: {
              reasoningEffort: "minimal",
            } satisfies OpenAIResponsesProviderOptions,
          },
        }
      : {}),
    onError: ({ error }) => {
      console.error("[chat] stream error:", error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
