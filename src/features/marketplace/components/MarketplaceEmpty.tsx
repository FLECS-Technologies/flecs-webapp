import { CloudOff } from 'lucide-react';

interface MarketplaceEmptyProps { error?: boolean; }

export default function MarketplaceEmpty({ error }: MarketplaceEmptyProps) {
  return (
    <div className="py-20 text-center">
      <CloudOff size={48} strokeWidth={1.2} style={{ opacity: 0.4, marginBottom: 16, display: 'inline-block' }} />
      <h6 className="text-base font-semibold mb-2">{error ? 'Failed to load marketplace' : 'No apps found'}</h6>
      <p className="text-sm text-muted">{error ? 'We could not reach the marketplace. Please try again later.' : 'Try adjusting your search or filters.'}</p>
    </div>
  );
}
