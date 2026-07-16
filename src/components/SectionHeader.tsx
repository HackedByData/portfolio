export default function SectionHeader({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  const label = `// ${index} · ${title}`;
  return (
    <h2 className="mb-8 font-mono text-lg sm:text-xl tracking-widest text-signal">
      <span
        className="reveal-type"
        style={{ "--type-ch": `${label.length}ch` } as React.CSSProperties}
      >
        {label}
      </span>
      {/* spec §5: blinking block cursor after key headings */}
      <span className="cursor-blink" aria-hidden />
    </h2>
  );
}
