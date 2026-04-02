import { Store, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyAppsProps {
  onSideload?: () => void;
}

export default function EmptyApps({ onSideload }: EmptyAppsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <Store size={48} strokeWidth={1.2} style={{ opacity: 0.4, marginBottom: 16 }} />
      <h6 className="text-base font-semibold mb-2">No apps installed</h6>
      <p className="text-sm text-muted mb-6 text-center">
        Install apps from the marketplace or deploy your own custom Docker app.
      </p>
      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition inline-flex items-center gap-2"
          onClick={() => navigate('/marketplace')}
        >
          <Store size={18} /> Browse Marketplace
        </button>
        {onSideload && (
          <button
            className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2"
            onClick={onSideload}
          >
            <PackagePlus size={18} /> Deploy Your Own App
          </button>
        )}
      </div>
    </div>
  );
}
