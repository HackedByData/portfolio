import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { ventures } from "@/data/modules";

export default function Modules() {
  return (
    <Reveal as="section" id="modules" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="03" title="INSTALLED MODULES" />
      <div className="grid gap-4 md:grid-cols-3">
        {ventures.map((v) => (
          <Panel key={v.id} title={v.name} className="flex flex-col">
            <p className="font-mono text-xs text-signal">{v.role}</p>
            <p className="reveal-item mt-3 flex-1 text-sm leading-relaxed text-body/85">
              {v.description}
            </p>
            <p className="mt-4 font-mono text-[11px] text-phosphor">
              ◉ {v.statusLine}
            </p>
            {v.href && (
              <a
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 font-mono text-xs text-signal underline decoration-signal/40 hover:decoration-signal"
              >
                &gt; {v.linkLabel}
              </a>
            )}
          </Panel>
        ))}
      </div>
    </Reveal>
  );
}
