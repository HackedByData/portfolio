import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { certification, diagnostics, specGroups } from "@/data/specs";

export default function SpecSheet() {
  return (
    <Reveal as="section" id="specs" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="01" title="SPEC SHEET" />
      <div className="grid gap-4 md:grid-cols-2">
        {specGroups.map((group) => (
          <Panel key={group.id} title={`${group.label} — ${group.status}`}>
            <ul className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  className="reveal-item border border-phosphor/30 px-2 py-1 font-mono text-xs text-body/90"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <p className="reveal-item mt-6 font-mono text-xs tracking-wide text-phosphor">
        {certification}
      </p>

      <Panel title="SELF-DIAGNOSTICS (unaudited)" className="mt-4">
        <ul className="space-y-3">
          {diagnostics.map((d) => (
            <li key={d.label} className="font-mono text-xs">
              <div className="flex justify-between text-phosphor">
                <span>{d.label}</span>
                <span>
                  {d.fill}% — {d.note}
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-signal/10">
                <div
                  className="bar-fill h-full bg-signal"
                  style={{ "--fill": `${d.fill}%` } as React.CSSProperties}
                />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </Reveal>
  );
}
