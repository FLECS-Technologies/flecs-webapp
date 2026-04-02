import { useMemo } from 'react';
import { Network, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppList } from '@features/apps/hooks/app-queries';
import { EditorButton } from '@features/apps/components/actions/editors/EditorButton';
import HelpButton from '@app/layout/HelpButton';
import { servicemesh } from '@app/layout/helplinks';

export default function ServiceMesh() {
  const { appList } = useAppList();
  const navigate = useNavigate();

  const meshApp = useMemo(() => {
    if (!appList) return null;
    return appList.find((app: any) => app.appKey?.name === 'tech.flecs.flunder') ?? null;
  }, [appList]);

  const meshInstance = meshApp?.instances?.[0];
  const hasEditor = meshInstance?.editors?.length > 0;

  return (
    <div>
      <div className="mb-3">
        <div className="flex items-center gap-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-muted">DEVICE</span>
          <HelpButton url={servicemesh} />
        </div>
        <h4 className="text-2xl font-extrabold">Service Mesh</h4>
        <p className="text-base text-muted mt-1">Network configuration and monitoring.</p>
      </div>

      <div className="rounded-xl bg-dark-end p-8 text-center">
        <Network size={48} strokeWidth={1.2} className="opacity-40 mx-auto mb-4" />

        {meshApp && hasEditor ? (
          <>
            <h6 className="text-lg font-semibold mb-2">Service Mesh is running</h6>
            <p className="text-sm text-muted mb-3">
              The service mesh has its own UI. Open it to manage your mesh configuration.
            </p>
            <EditorButton editor={meshInstance.editors[0]} index={0} />
          </>
        ) : (
          <>
            <h6 className="text-lg font-semibold mb-2">
              {meshApp ? 'Service Mesh is installed' : 'Service Mesh not installed'}
            </h6>
            <p className="text-sm text-muted mb-3">
              {meshApp
                ? 'Start the service mesh app to access its UI.'
                : 'Install the FLECS Service Mesh from the marketplace to connect your apps.'}
            </p>
            {!meshApp && (
              <button
                className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition inline-flex items-center gap-2"
                onClick={() => navigate('/marketplace')}
              >
                <Store size={18} />
                Go to Marketplace
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
