import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { profile } from "@/data/profile";

const channels = [
  { label: "EMAIL", value: profile.email, href: `mailto:${profile.email}` },
  { label: "LINKEDIN", value: "linkedin", href: profile.linkedin },
  { label: "GITHUB", value: "hackedbydata", href: profile.github },
  { label: "PARASOURCE", value: "parasource.ai", href: profile.parasource },
] as const;

export default function Uplink() {
  return (
    <Reveal as="section" id="uplink" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="07" title="UPLINK" />
      <Panel title="OPEN CHANNELS">
        <ul className="grid gap-3 font-mono text-sm sm:grid-cols-2">
          {channels.map((c) => (
            <li key={c.label} className="reveal-item">
              <span className="text-phosphor">{c.label}: </span>
              <a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-signal underline decoration-signal/40 hover:decoration-signal"
              >
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      </Panel>
      <footer className="mt-16 border-t border-signal/10 pt-6 pb-10 text-center font-mono text-xs text-phosphor/70">
        © 2026 Devin McCaw. No robots were harmed in the making of this unit.
      </footer>
    </Reveal>
  );
}
