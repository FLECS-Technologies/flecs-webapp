import { CheckCircle2, AlertCircle } from 'lucide-react';
import MarketplaceLogin from '@features/marketplace/components/MarketplaceLogin';
import { useMarketplaceUser } from '@stores/marketplace-user';
import { useGetDeviceLicenseActivationStatus, usePostDeviceLicenseActivation, getGetDeviceLicenseActivationStatusQueryKey } from '@generated/core/device/device';
import { useQueryClient } from '@tanstack/react-query';

export default function DeviceActivation({ variant }: { variant?: string }) {
  const qc = useQueryClient();
  const { user } = useMarketplaceUser();
  const { data, isLoading } = useGetDeviceLicenseActivationStatus({ query: { staleTime: 60_000 } });
  const { mutate: activate, isPending: activating, isError } = usePostDeviceLicenseActivation({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetDeviceLicenseActivationStatusQueryKey() }) },
  });

  const activated = (data as any)?.data?.isValid ?? false;

  if (isLoading) return <p className="text-sm text-muted">Checking license...</p>;

  if (activated) return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={20} className="text-success" />
      <span className="text-sm">Device is activated!</span>
    </div>
  );

  // Not activated — show marketplace login or retry button
  return (
    <div>
      {!user ? (
        <>
          <div className="px-4 py-3 rounded-lg mb-4 bg-accent/10 text-accent">
            <p className="font-semibold mb-1">Device Activation Required</p>
            <p className="text-sm">Login with your marketplace account to activate this device.</p>
          </div>
          <MarketplaceLogin />
        </>
      ) : (
        <div className="flex items-center gap-4">
          <AlertCircle size={20} />
          <span className="text-sm">{activating ? 'Activating...' : isError ? 'Activation failed. Try again.' : 'Device is not activated!'}</span>
          <button onClick={() => activate()} disabled={activating} className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition disabled:opacity-50">
            Activate Device
          </button>
        </div>
      )}
    </div>
  );
}
