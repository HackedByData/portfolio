"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  as = "div",
  id,
  className = "",
  children,
}: {
  as?: "div" | "section";
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      // Reveal only ever renders div/section; the ref type is compatible.
      ref={ref as React.Ref<HTMLDivElement>}
      id={id}
      className={`reveal ${revealed ? "is-revealed" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
