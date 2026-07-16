"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const BOOT_LINES = [
  "> INITIALIZING DEVIN.OS v2.7 ............ OK",
  "> MOUNTING /dev/ambition ................ OK",
  "> LOADING SALES_ENGINE.dll .............. 200% CAPACITY",
  "> CALIBRATING NEURAL CORE ............... OK",
  "> HUMILITY MODULE ....................... NOT FOUND (skipping)",
  "> UNIT READY. WELCOME, VISITOR.",
];

const STORAGE_KEY = "devin-os-booted";
const LINE_INTERVAL_MS = 220;
const LINGER_MS = 600;

// The "should the boot sequence play" decision depends on client-only APIs
// (localStorage, matchMedia). useSyncExternalStore lets us read them safely:
// getServerSnapshot() drives both the server render AND React's first
// client render pass during hydration (so they always agree and there's no
// mismatch), then React reconciles against the real getSnapshot() value
// immediately after mount without us manually setState-ing inside an effect.
function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

function getClientSnapshot() {
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const booted = localStorage.getItem(STORAGE_KEY) === "1";
  return !reduced && !booted;
}

export default function BootOverlay() {
  const shouldBoot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  const active = shouldBoot && !dismissed;

  useEffect(() => {
    if (!active) return;
    if (lineCount >= BOOT_LINES.length) {
      const t = setTimeout(() => dismiss(), LINGER_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLineCount((c) => c + 1), LINE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [active, lineCount]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  useEffect(() => {
    if (!active) return;
    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center bg-bg"
      role="button"
      aria-label="Skip boot sequence"
    >
      <div className="mx-auto w-full max-w-2xl px-6 font-mono text-sm text-signal">
        {BOOT_LINES.slice(0, lineCount).map((line) => (
          <div key={line} className="py-0.5">
            {line}
          </div>
        ))}
        <span className="cursor-blink" />
        <div className="mt-6 text-xs text-phosphor">
          [ click or press any key to skip ]
        </div>
      </div>
    </div>
  );
}
