export default function GenreChip({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors";
  const classes = active
    ? `${base} bg-accent text-white`
    : `${base} bg-surface text-muted border border-border-color hover:text-text hover:border-muted`;

  if (!onClick) {
    return <span className={classes}>{label}</span>;
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {label}
    </button>
  );
}
