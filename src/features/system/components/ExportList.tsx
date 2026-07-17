import React, { useState } from 'react';
import { Archive, Download, Trash2 } from 'lucide-react';
import {
  useGetExports,
  useDeleteExportsExportId,
  getExportsExportId,
} from '@generated/core/flecsport/flecsport';
import type { ExportId } from '@generated/core/schemas';

// Export tarballs can be large; allow up to 10 min to transfer before aborting.
const DOWNLOAD_TIMEOUT_MS = 10 * 60_000;

export default function ExportList() {
  const { data: exportsResponse, isLoading: loading, isError, refetch } = useGetExports();
  const { mutateAsync: deleteExport } = useDeleteExportsExportId();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const exports = (exportsResponse?.data ?? []) as ExportId[];

  const handleDownload = async (exportId: string) => {
    setDownloading(exportId);
    try {
      // Exports can be large; the shared customInstance default caps requests at
      // 15s, which aborts big downloads. Give this blob fetch a generous cap.
      const response = await getExportsExportId(exportId, {
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flecs-export-${exportId}.tar`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Download failed');
    }
    setDownloading(null);
  };
  const handleDelete = async (exportId: string) => {
    setDeleting(exportId);
    try {
      await deleteExport({ exportId });
      refetch();
    } catch {
      setError('Delete failed');
    }
    setDeleting(null);
  };

  if (loading)
    return (
      <div className="flex min-h-24 items-center justify-center bg-surface-overlay">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  if (isError || error)
    return (
      <p className="bg-surface-overlay px-5 py-7 text-center text-xs text-error">
        {error || 'Failed to load exports'}
      </p>
    );
  if (!exports.length)
    return (
      <div className="bg-surface-overlay px-5 py-7 text-center">
        <p className="text-[0.82rem] font-medium">No exports yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
          Your first export will appear here, ready to download or import on another device.
        </p>
      </div>
    );

  return (
    <ul className="divide-y divide-border bg-surface-overlay" aria-label="Recent exports">
      {exports.map((exportId) => (
        <li key={exportId} className="flex items-center gap-3 px-5 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-raised text-muted">
            <Archive size={15} />
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-xs" title={exportId}>
            {exportId}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <button
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium transition hover:border-border-strong hover:bg-surface-hover disabled:opacity-50"
              aria-label={`Download export ${exportId}`}
              onClick={() => handleDownload(exportId)}
              disabled={deleting === exportId}
            >
              {downloading === exportId ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Download size={13} />
              )}
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-error/10 hover:text-error disabled:opacity-50"
              aria-label={`Delete export ${exportId}`}
              onClick={() => handleDelete(exportId)}
              disabled={downloading === exportId}
            >
              {deleting === exportId ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
