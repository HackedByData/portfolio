export default function Panel({
  title,
  className = "",
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`panel-brackets p-5 ${className}`}>
      {title && (
        <div className="font-mono text-xs tracking-widest text-phosphor border-b border-signal/15 pb-2 mb-4">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
