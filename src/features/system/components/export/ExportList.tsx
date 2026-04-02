import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useGetExports, useDeleteExportsExportId, getExportsExportId } from '@generated/core/flecsport/flecsport';
import type { ExportId } from '@generated/core/schemas';

export default function ExportList() {
  const { data: exportsResponse, isLoading: loading, isError, refetch } = useGetExports();
  const { mutateAsync: deleteExport } = useDeleteExportsExportId();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const exports = (exportsResponse?.data ?? []) as ExportId[];

  const handleDownload = async (exportId: string) => { setDownloading(exportId); try { const response = await getExportsExportId(exportId); const blob = response.data as Blob; const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `flecs-export-${exportId}.tar`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); } catch { setError('Download failed'); } setDownloading(null); };
  const handleDelete = async (exportId: string) => { setDeleting(exportId); try { await deleteExport({ exportId }); refetch(); } catch { setError('Delete failed'); } setDeleting(null); };

  if (loading) return <div className="flex justify-center items-center min-h-[200px]"><div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" /></div>;
  if (isError || error) return <p className="text-error text-center mt-4">{error || 'Failed to load exports'}</p>;
  if (!exports.length) return <p className="text-center mt-4 text-sm text-muted">No exports found.</p>;

  return (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-white/10"><td className="px-4 py-2 font-semibold" colSpan={2}>Exports</td></tr></thead>
      <tbody>{exports.map(exportId => (
        <tr key={exportId} className="border-b border-white/10"><td className="px-4 py-2">{exportId}</td><td className="px-4 py-2 text-right">
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition" aria-label="download" onClick={() => handleDownload(exportId)} disabled={deleting === exportId}><Download size={18} /></button>
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition ml-2" aria-label="delete" onClick={() => handleDelete(exportId)} disabled={downloading === exportId}><Trash2 size={18} /></button>
        </td></tr>
      ))}</tbody>
    </table>
  );
}
