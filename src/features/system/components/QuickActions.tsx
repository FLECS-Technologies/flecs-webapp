import { useState } from 'react';
import { FileText, FolderDown } from 'lucide-react';
import Export from '@features/system/components/data-transfer/Export';
import Import from '@features/system/components/data-transfer/Import';
import { Link } from 'react-router';
import { useTenant } from '@app/theme/TenantContext';

export default function QuickActions() {
  const { app_title: appTitle } = useTenant();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="rounded-xl bg-surface-raised p-6 border border-border">
      <h6 className="text-base font-semibold mb-4">Quick Actions</h6>
      <div className="flex items-center gap-4 flex-wrap">
        <span title="Export apps from this device">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
            onClick={() => setExportOpen(true)}
          >
            <FolderDown size={16} />
            Export Apps
          </button>
        </span>
        <span title="Import apps from a backup file">
          <Import mode="restore" />
        </span>
        <Link
          to="/open-source"
          className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 text-sm"
        >
          <FileText size={16} /> Open Source
        </Link>
      </div>
      <Export open={exportOpen} setOpen={setExportOpen} appTitle={appTitle} />
    </div>
  );
}
