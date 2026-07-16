"use client";

import { useEffect, useRef, useState } from "react";
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { benchmarks, type Benchmark } from "@/data/benchmarks";

function CountUpStat({ benchmark }: { benchmark: Benchmark }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        observer.disconnect();
        if (reduced) {
          setValue(benchmark.end);
          return;
        }
        const duration = 1200;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(benchmark.end * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [benchmark.end]);

  return (
    <div ref={ref}>
      <div className="font-mono text-4xl font-bold text-signal sm:text-5xl">
        {benchmark.format(value)}
      </div>
      <div className="mt-2 font-mono text-xs tracking-widest text-phosphor">
        {benchmark.label}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-body/85">
        {benchmark.caption}
      </p>
    </div>
  );
}

export default function Benchmarks() {
  return (
    <Reveal
      as="section"
      id="benchmarks"
      className="mx-auto max-w-5xl px-4 py-20"
    >
      <SectionHeader index="02" title="BENCHMARKS" />
      <p className="reveal-item mb-6 font-mono text-xs text-phosphor">
        performance under retail combat conditions. all figures literal.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {benchmarks.map((b) => (
          <Panel key={b.id}>
            <CountUpStat benchmark={b} />
          </Panel>
        ))}
      </div>
    </Reveal>
  );
}
