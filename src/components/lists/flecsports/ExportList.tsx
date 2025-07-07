import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  CircularProgress,
  Box,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../../api/flecs-core/api-client';

export default function ExportList() {
  const [exports, setExports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.export
      .exportsGet()
      .then((res: any) => {
        setExports(res.data || []);
        setError(null);
      })
      .catch(() => {
        setError('Failed to load exports');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (exportId: string) => {
    setDownloading(exportId);
    try {
      const response = await api.export.exportsExportIdGet(exportId, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
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
      await api.export.exportsExportIdDelete(exportId);
      setExports(exports.filter((e) => e !== exportId));
    } catch {
      setError('Delete failed');
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  if (!exports.length) {
    return (
      <Typography align="center" sx={{ mt: 2 }}>
        No exports found.
      </Typography>
    );
  }

  return (
    <Table size="small" aria-label="exports-table">
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>
            <Typography variant="h6">Exports</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {exports.map((exportId) => (
          <TableRow key={exportId} style={{ borderBottom: 'none' }}>
            <TableCell style={{ borderBottom: 'none' }}>{exportId}</TableCell>
            <TableCell align="right" style={{ borderBottom: 'none' }}>
              <IconButton
                aria-label="download"
                onClick={() => handleDownload(exportId)}
                loading={downloading === exportId}
                disabled={deleting === exportId}
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                aria-label="delete"
                onClick={() => handleDelete(exportId)}
                loading={deleting === exportId}
                disabled={downloading === exportId}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
