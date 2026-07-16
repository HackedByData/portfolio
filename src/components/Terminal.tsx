"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import {
  RESTING_MESSAGE,
  SESSION_LIMIT_MESSAGE,
  TRANSIENT_ERROR_MESSAGE,
  chips,
  easterEggs,
  scriptedResponses,
} from "@/data/easter-eggs";
import { MAX_INPUT_CHARS, MAX_MESSAGES_PER_SESSION } from "@/lib/chat-guards";

type Entry =
  | { kind: "user"; text: string }
  | { kind: "local"; text: string } // easter eggs, system notices
  | { kind: "assistant"; index: number };

export default function Terminal() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scripted, setScripted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status, error, clearError } = useChat({
    onError: (err) => {
      // Spec §9: rate-limited / keyless → scripted mode; a transient stream
      // or network error → friendly line, retry stays allowed. Our route puts
      // the cause in the JSON error body, which the transport surfaces in
      // err.message; unknown causes are treated as transient.
      const msg = err?.message ?? "";
      const permanent =
        msg.includes("RATE_LIMITED") || msg.includes("UNIT_RESTING");
      setEntries((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.kind === "assistant") next.pop(); // drop the pending slot
        next.push({
          kind: "local",
          text: permanent ? RESTING_MESSAGE : TRANSIENT_ERROR_MESSAGE,
        });
        return next;
      });
      if (permanent) setScripted(true);
    },
  });

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const userCount = entries.filter((e) => e.kind === "user").length;
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries, messages]);

  function print(text: string) {
    setEntries((prev) => [...prev, { kind: "local", text }]);
  }

  function submit(raw: string, chipId?: string) {
    const text = raw.trim();
    if (!text || busy) return;
    setInput("");

    const lower = text.toLowerCase();

    // local commands first — zero cost. Object.hasOwn + typeof guard against
    // prototype keys ("constructor", "__proto__") crashing the render.
    if (lower === "clear") {
      setEntries([]);
      return;
    }
    if (
      Object.hasOwn(easterEggs, lower) &&
      typeof easterEggs[lower] === "string"
    ) {
      setEntries((prev) => [
        ...prev,
        { kind: "user", text },
        { kind: "local", text: easterEggs[lower] },
      ]);
      return;
    }

    // scripted fallback mode: chips answer canned, free text gets the rest notice
    if (scripted) {
      setEntries((prev) => [
        ...prev,
        { kind: "user", text },
        {
          kind: "local",
          text:
            chipId && Object.hasOwn(scriptedResponses, chipId)
              ? scriptedResponses[chipId]
              : RESTING_MESSAGE,
        },
      ]);
      return;
    }

    // session cap (server re-enforces)
    if (userCount >= MAX_MESSAGES_PER_SESSION) {
      setEntries((prev) => [
        ...prev,
        { kind: "user", text },
        { kind: "local", text: SESSION_LIMIT_MESSAGE },
      ]);
      return;
    }

    if (error) clearError();
    setEntries((prev) => [
      ...prev,
      { kind: "user", text },
      { kind: "assistant", index: assistantMessages.length },
    ]);
    sendMessage({ text });
  }

  function renderAssistant(index: number) {
    const message = assistantMessages[index];
    if (!message) {
      return <span className="cursor-blink text-phosphor">processing</span>;
    }
    return (
      <>
        {message.parts.map((part, i) =>
          part.type === "text" ? <span key={i}>{part.text}</span> : null,
        )}
        {index === assistantMessages.length - 1 && busy && (
          <span className="cursor-blink" />
        )}
      </>
    );
  }

  return (
    <Reveal as="section" id="terminal" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="06" title="INTERROGATION TERMINAL" />

      <div className="panel-brackets">
        <div className="flex items-center justify-between border-b border-signal/15 px-4 py-2 font-mono text-[11px] tracking-widest text-phosphor">
          <span>INTERROGATION_TERMINAL — cleared for public disclosure</span>
          <span>{scripted ? "MODE: SCRIPTED" : "LLM-POWERED"}</span>
        </div>

        <div
          ref={scrollRef}
          className="h-80 overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed"
          aria-live="polite"
        >
          {entries.length === 0 && (
            <p className="text-phosphor">
              the unit is listening. ask it anything — or start with a button
              below.
            </p>
          )}
          {entries.map((entry, i) => (
            <div key={i} className="mt-2 whitespace-pre-wrap">
              {entry.kind === "user" ? (
                <span className="text-body">
                  <span className="text-signal">
                    visitor@devinmccaw.com:~$
                  </span>{" "}
                  {entry.text}
                </span>
              ) : entry.kind === "local" ? (
                <span className="text-phosphor">{entry.text}</span>
              ) : (
                <span className="text-body/90">{renderAssistant(entry.index)}</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-signal/15 px-4 py-3">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={busy}
              onClick={() => submit(chip.prompt, chip.id)}
              className="border border-phosphor/40 px-3 py-1 font-mono text-xs text-phosphor hover:border-signal hover:text-signal disabled:opacity-40"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t border-signal/15 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <span className="font-mono text-sm text-signal">
            visitor@devinmccaw.com:~$
          </span>
          <input
            value={input}
            maxLength={MAX_INPUT_CHARS}
            onChange={(e) => setInput(e.currentTarget.value)}
            disabled={busy}
            placeholder={busy ? "unit is processing…" : "type here"}
            aria-label="Ask the DEVIN unit a question"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-body outline-none placeholder:text-phosphor/50"
          />
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="border border-signal/60 px-3 py-1 font-mono text-xs text-signal hover:bg-signal hover:text-bg disabled:opacity-40"
          >
            SEND
          </button>
        </form>
      </div>

      <p className="mt-3 font-mono text-[11px] text-phosphor/70">
        live model, tiny token budget, grounded in the resume. it cannot make
        things up about the unit — rule 1 of its system prompt.
      </p>
    </Reveal>
  );
}
