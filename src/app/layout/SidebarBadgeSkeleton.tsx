export default function SidebarBadgeSkeleton({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      role="status"
      aria-label={`Loading ${label} count`}
      className={`h-5 w-7 shrink-0 animate-pulse rounded ${
        active ? 'bg-brand/15' : 'bg-surface-hover'
      }`}
    />
  );
}
