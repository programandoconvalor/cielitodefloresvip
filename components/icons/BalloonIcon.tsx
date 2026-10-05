export function BalloonIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <ellipse cx="12" cy="8" rx="5" ry="7" />
      <path d="M12 15V20" />
      <path d="M12 20C10 21 14 22 12 24" />
    </svg>
  );
}