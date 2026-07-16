import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-24 space-y-[60vh]">
      <Reveal as="section">
        <SectionHeader index="00" title="SMOKE TEST" />
        <Panel title="PANEL TEST">
          <p className="reveal-item">bracketed panel renders</p>
        </Panel>
      </Reveal>
      <Reveal as="section">
        <SectionHeader index="01" title="SECOND SECTION" />
        <Panel>
          <p className="reveal-item">scrolling reveals this late</p>
        </Panel>
      </Reveal>
    </main>
  );
}
