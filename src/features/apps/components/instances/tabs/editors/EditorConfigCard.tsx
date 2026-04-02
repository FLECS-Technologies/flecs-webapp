import React, { useState } from 'react';
import { Trash2, Save, ExternalLink } from 'lucide-react';
import { InstanceEditor } from '@generated/core/schemas';
import { usePutInstancesInstanceIdConfigEditorsPortPathPrefix, useDeleteInstancesInstanceIdConfigEditorsPortPathPrefix } from '@generated/core/instances/instances';
import { EditorConfigSnackbar } from '../EditorConfigTab';
import { createUrl } from '@features/apps/components/actions/editors/EditorButton';
import { host } from '@app/api/ApiProvider';

interface EditorConfigCardProps { editor: InstanceEditor; instanceId: string; setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>; setSnackbarState: React.Dispatch<React.SetStateAction<EditorConfigSnackbar>>; }
const createCustomUrl = (editorUrl: string) => { const base = host(); if (!base) return editorUrl; return new URL(editorUrl, base).toString(); };

const EditorConfigCard: React.FC<EditorConfigCardProps> = ({ editor, instanceId, setSnackbarOpen, setSnackbarState }) => {
  const [editor_path_prefix, setEditorPathPrefix] = useState(editor.path_prefix || '');
  const [current_editor_path_prefix, setCurrentEditorPathPrefix] = useState<string | undefined>(editor.path_prefix);
  const { mutateAsync: putPrefix } = usePutInstancesInstanceIdConfigEditorsPortPathPrefix();
  const { mutateAsync: deletePrefix } = useDeleteInstancesInstanceIdConfigEditorsPortPathPrefix();

  const putEditorPrefix = async (port: number, pathPrefix: string) => { try { await putPrefix({ instanceId, port, data: { path_prefix: pathPrefix } }); setCurrentEditorPathPrefix(pathPrefix); setSnackbarState({ alertSeverity: 'success', snackbarText: 'Editor prefix saved', clipBoardContent: '' }); setSnackbarOpen(true); } catch (error) { setSnackbarState({ alertSeverity: 'error', snackbarText: 'Failed to save editor prefix', clipBoardContent: '' + error }); setSnackbarOpen(true); } };
  const deleteEditorPrefix = async (port: number) => { try { await deletePrefix({ instanceId, port }); setCurrentEditorPathPrefix(undefined); setEditorPathPrefix(''); setSnackbarState({ alertSeverity: 'success', snackbarText: 'Editor prefix deleted', clipBoardContent: '' }); setSnackbarOpen(true); } catch (error) { setSnackbarState({ alertSeverity: 'error', snackbarText: 'Failed to delete editor prefix', clipBoardContent: '' + error }); setSnackbarOpen(true); } };

  const fixedUrl = createUrl(editor.url);
  const customUrl = editor_path_prefix ? createCustomUrl('/' + editor_path_prefix) : '';

  return (
    <div className="p-4 rounded-xl border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold">{editor.name || 'Editor'}</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-muted">:{editor.port}</span>
      </div>
      <div className="mb-3"><p className="text-xs text-muted font-semibold mb-1">Fixed URL</p><p className="text-xs font-mono text-muted break-all">{fixedUrl}</p></div>
      <div className={customUrl ? 'mb-3' : ''}>
        <div className="flex items-center gap-2">
          <input value={editor_path_prefix} placeholder="e.g. apps/my-app" onChange={(e) => setEditorPathPrefix(e.target.value)} className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white placeholder-muted focus:outline-none focus:border-brand text-sm font-mono" />
          <button title="Save" className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30" aria-label="put-editor-prefix-button" disabled={!editor_path_prefix || editor_path_prefix === current_editor_path_prefix} onClick={() => putEditorPrefix(editor.port, editor_path_prefix)}><Save size={16} className="text-brand" /></button>
          <button title="Delete prefix" className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30" aria-label="delete-editor-prefix-button" disabled={current_editor_path_prefix === undefined} onClick={() => deleteEditorPrefix(editor.port)}><Trash2 size={16} /></button>
        </div>
      </div>
      {customUrl && (
        <div><p className="text-xs text-muted font-semibold mb-1">Custom URL</p><div className="flex items-center gap-2"><p className="text-xs font-mono text-accent break-all flex-1">{customUrl}</p><button title="Open in new tab" className="p-1.5 rounded-lg hover:bg-white/10 transition" onClick={() => window.open(customUrl)}><ExternalLink size={14} /></button></div></div>
      )}
    </div>
  );
};
export default EditorConfigCard;
