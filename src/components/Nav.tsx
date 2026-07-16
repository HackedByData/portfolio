const links = [
  ["SPECS", "#specs"],
  ["BENCHMARKS", "#benchmarks"],
  ["MODULES", "#modules"],
  ["TERMINAL", "#terminal"],
  ["UPLINK", "#uplink"],
] as const;

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-signal/15 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="#top" className="font-mono text-sm text-signal">
          DEVIN.OS
        </a>
        <div className="flex gap-1 overflow-x-auto font-mono text-[11px] sm:text-xs text-phosphor">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap px-2 py-1 hover:text-signal"
            >
              [ {label} ]
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
