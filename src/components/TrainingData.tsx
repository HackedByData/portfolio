import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { education, overclockLine } from "@/data/education";

export default function TrainingData() {
  return (
    <Reveal as="section" id="training" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="04" title="TRAINING DATA" />
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((e) => (
          <Panel key={e.school} title={e.school.toUpperCase()}>
            <p className="text-sm font-semibold text-body">{e.credential}</p>
            <p className="mt-1 font-mono text-xs text-phosphor">{e.period}</p>
            <ul className="reveal-item mt-3 space-y-1 text-sm text-body/85">
              {e.details.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
      {/* one of the page's two amber moments (spec §5) */}
      <p className="reveal-item mt-6 font-mono text-xs tracking-wide text-amber">
        ⚠ {overclockLine}
      </p>
    </Reveal>
  );
}
