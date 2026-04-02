import { FileText } from 'lucide-react';
import Export from '@features/system/components/data-transfer/Export';
import Import from '@features/system/components/data-transfer/Import';
import { Link } from 'react-router-dom';

export default function QuickActions() {
  return (
    <div className="rounded-xl bg-dark-end p-6 border border-white/10">
      <h6 className="text-base font-semibold mb-4">Quick Actions</h6>
      <div className="flex items-center gap-4 flex-wrap">
        <span title="Export all apps and data from this device"><Export /></span>
        <span title="Import apps from a backup file"><Import /></span>
        <Link to="/open-source" className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 text-sm"><FileText size={16} /> Open Source</Link>
      </div>
    </div>
  );
}
