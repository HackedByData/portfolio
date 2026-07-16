import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { changelog } from "@/data/changelog";

export default function Changelog() {
  return (
    <Reveal
      as="section"
      id="changelog"
      className="mx-auto max-w-5xl px-4 py-20"
    >
      <SectionHeader index="06" title="CHANGELOG" />
      <ol className="border-l border-signal/20 pl-6">
        {changelog.map((entry) => (
          <li key={entry.version} className="reveal-item relative pb-8">
            <span className="absolute -left-[27px] top-1 h-2 w-2 bg-signal" />
            <div className="font-mono text-xs text-signal">
              {entry.version}{" "}
              <span className="text-phosphor">· {entry.date}</span>
            </div>
            <div className="mt-1 font-semibold text-body">{entry.title}</div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-body/80">
              {entry.detail}
            </p>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
