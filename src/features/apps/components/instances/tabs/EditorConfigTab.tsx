import React, { useState } from 'react';
import ActionSnackbar from '@app/components/ActionSnackbar';
import { InstanceEditor } from '@generated/core/schemas';
import { useGetInstancesInstanceIdConfigEditors } from '@generated/core/instances/instances';
import EditorConfigCard from './editors/EditorConfigCard';

interface EditorConfigTabProps { instanceId: string; onChange: (hasChanges: boolean) => void; }
export interface EditorConfigSnackbar { snackbarText: string; alertSeverity: string; clipBoardContent: string; }

const EditorConfigTab: React.FC<EditorConfigTabProps> = ({ instanceId, onChange }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({ snackbarText: 'Info', alertSeverity: 'success', clipBoardContent: '' });
  const { data: editorsResponse, isLoading } = useGetInstancesInstanceIdConfigEditors(instanceId);
  const editors: InstanceEditor[] = (editorsResponse?.data as InstanceEditor[]) ?? [];

  if (isLoading) return <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" />;

  return (
    <div>
      {editors.length === 0 ? <p className="text-sm text-muted">App has no editors.</p> : (
        <div className="flex flex-col gap-4">{editors.map((editor, index) => <EditorConfigCard key={index} instanceId={instanceId} editor={editor} setSnackbarOpen={setSnackbarOpen} setSnackbarState={setSnackbarState} />)}</div>
      )}
      <ActionSnackbar text={snackbarState.snackbarText} open={snackbarOpen} setOpen={setSnackbarOpen} alertSeverity={snackbarState.alertSeverity} />
    </div>
  );
};
export default EditorConfigTab;
