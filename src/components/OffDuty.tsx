import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { offDuty } from "@/data/off-duty";

export default function OffDuty() {
  return (
    <Reveal as="section" id="offduty" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="05" title="OFF-DUTY PROTOCOLS" />
      <Panel title="PHYSICAL SUBSYSTEMS — MAINTENANCE & RECREATION">
        <ul className="space-y-5">
          {offDuty.map((o) => (
            <li key={o.label} className="reveal-item">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-xs tracking-widest text-phosphor">
                  {o.label}
                </span>
                <span className="font-mono text-[11px] tracking-wide text-signal">
                  [{o.status}]
                </span>
              </div>
              <p className="mt-1 text-sm text-body/90">{o.value}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </Reveal>
  );
}
