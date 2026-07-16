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
        style={
          {
            // 1ch per glyph plus the h2's tracking-widest (0.1em) per glyph —
            // ch alone under-measures letter-spaced text and clips the label.
            "--type-ch": `calc(${label.length} * (1ch + 0.1em))`,
            "--type-steps": label.length,
          } as React.CSSProperties
        }
      >
        {label}
      </span>
      {/* spec §5: blinking block cursor after key headings */}
      <span className="cursor-blink" aria-hidden />
    </h2>
  );
}
