import LicenseInfo from './device/license/LicenseInfo';
import DeviceActivation from '@features/auth/components/device/DeviceActivation';

export default function LicenseCard() {
  return (
    <div className="rounded-xl bg-dark-end p-6 border border-white/10">
      <h6 className="text-base font-semibold mb-4">License</h6>
      <LicenseInfo />
      <DeviceActivation variant="line" />
    </div>
  );
}
