import React from 'react';
import { ExternalLink } from 'lucide-react';

interface EditorButtonProps {
  editor: { url: string; name?: string };
  index: number;
}

export const createUrl = (editorUrl: string) => {
  let baseURL: string = window.location.protocol + '//';
  if (import.meta.env.DEV) {
    baseURL = import.meta.env.VITE_APP_DEV_CORE_URL || '';
  } else {
    baseURL = baseURL.concat(window.location.host);
  }
  return baseURL + '/api' + editorUrl;
};

export const EditorButton: React.FC<EditorButtonProps> = ({ editor, index }: EditorButtonProps) => {
  return (
    <div className="inline-flex">
      <button
        title={`Open ${editor.name || 'app'} in a new tab`}
        aria-label={`open-editor-button-${index}`}
        onClick={() => window.open(createUrl(editor.url))}
        className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-end transition inline-flex items-center gap-2"
      >
        <ExternalLink size={16} />
        {`Open ${editor.name || 'app'}`}
      </button>
    </div>
  );
};
