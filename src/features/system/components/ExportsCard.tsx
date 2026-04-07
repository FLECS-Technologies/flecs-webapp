import ExportList from './ExportList';

export default function ExportsCard() {
  return (
    <div className="rounded-xl bg-dark-end p-6 border border-white/10">
      <h6 className="text-base font-semibold mb-4">Recent Exports</h6>
      <ExportList />
    </div>
  );
}
