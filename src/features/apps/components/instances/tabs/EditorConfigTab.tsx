import React from 'react';
import { InstanceEditor } from '@generated/core/schemas';
import { useGetInstancesInstanceIdConfigEditors } from '@generated/core/instances/instances';
import EditorConfigCard from './EditorConfigCard';

interface EditorConfigTabProps { instanceId: string; onChange: (hasChanges: boolean) => void; }

const EditorConfigTab: React.FC<EditorConfigTabProps> = ({ instanceId, onChange }) => {
  const { data: editorsResponse, isLoading } = useGetInstancesInstanceIdConfigEditors(instanceId);
  const editors: InstanceEditor[] = (editorsResponse?.data as InstanceEditor[]) ?? [];

  if (isLoading) return <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" />;

  return (
    <div>
      {editors.length === 0 ? <p className="text-sm text-muted">App has no editors.</p> : (
        <div className="flex flex-col gap-4">{editors.map((editor, index) => <EditorConfigCard key={index} instanceId={instanceId} editor={editor} />)}</div>
      )}
    </div>
  );
};
export default EditorConfigTab;
