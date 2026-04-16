import React from 'react';
import { useGetDeviceLicenseActivationStatus } from '@generated/core/device/device';
import { useGetDeviceLicenseInfo } from '@generated/core/device/device';
import { unwrapSuccess } from '@app/api/unwrap';

function LicenseInfo() {
  const { data: licData } = useGetDeviceLicenseActivationStatus({ query: { staleTime: 60_000 } }); const activated = unwrapSuccess(licData)?.isValid ?? false;
  const { data: response, isLoading: loading, isError: error } = useGetDeviceLicenseInfo({ query: { queryKey: [`/device/license/info`, activated] } });
  const info = response?.data;

  return (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-white/10"><td className="px-4 py-2 font-semibold" colSpan={2}>License information</td></tr></thead>
      {error && <tbody><tr><td className="px-4 py-2" colSpan={2}>Error loading the license information.</td></tr></tbody>}
      {loading && <tbody><tr><td className="px-4 py-2"><div className="animate-pulse bg-white/10 rounded h-4" /></td><td className="px-4 py-2"><div className="animate-pulse bg-white/10 rounded h-4" /></td></tr></tbody>}
      {info && (
        <tbody>
          {info.license && <tr><td className="px-4 py-2">License</td><td className="px-4 py-2">{info.license}</td></tr>}
          {info.sessionId?.id && <tr><td className="px-4 py-2">Session ID</td><td className="px-4 py-2">{info.sessionId.id}</td></tr>}
          {info.sessionId?.timestamp && <tr><td className="px-4 py-2">Last session renewal</td><td className="px-4 py-2">{String(info.sessionId.timestamp)}</td></tr>}
        </tbody>
      )}
    </table>
  );
}
export default LicenseInfo;
