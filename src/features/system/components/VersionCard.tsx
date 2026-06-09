import Version from './Version';

export default function VersionCard() {
  return (
    <div className="rounded-xl bg-surface-raised p-6 border border-border">
      <h6 className="text-base font-semibold mb-4">FLECS Version</h6>
      <Version />
    </div>
  );
}
