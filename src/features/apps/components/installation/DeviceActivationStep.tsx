import React from 'react';
import { useGetDeviceLicenseActivationStatus } from '@generated/core/device/device';
import DeviceActivation from '@features/auth/components/device/DeviceActivation';

interface DeviceActivationStepProps { handleNext?: () => void; }

function DeviceActivationStep({ handleNext }: DeviceActivationStepProps) {
  const { data: licData } = useGetDeviceLicenseActivationStatus({ query: { staleTime: 60_000 } }); const activated = (licData as any)?.data?.isValid ?? false;
  React.useEffect(() => { if (activated && handleNext) handleNext(); }, [activated]);
  return (
    <div data-testid="device-activation-step" className="flex flex-col items-center justify-center gap-2 min-h-[350px] mt-4">
      <div><DeviceActivation /></div>
    </div>
  );
}
export default DeviceActivationStep;
