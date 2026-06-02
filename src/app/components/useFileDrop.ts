import { useState, useRef } from 'react';

interface FileDropOptions {
  /** Allowed extensions (lowercase, with dot), e.g. ['.json', '.tar.gz'].
   *  Omit to accept any file and validate downstream. */
  accept?: string[];
  onFile: (file: File) => void;
  /** Called when the dropped file doesn't match `accept`. */
  onReject?: (file: File) => void;
  disabled?: boolean;
}

/**
 * Native HTML5 drag-and-drop for a single file. Spread `dropProps` on the
 * target element and use `isDragOver` for visual feedback.
 */
export function useFileDrop({ accept, onFile, onReject, disabled }: FileDropOptions) {
  const [isDragOver, setIsDragOver] = useState(false);
  // dragenter/dragleave also fire when moving over child elements — track depth
  const depth = useRef(0);

  const matches = (name: string) =>
    !accept || accept.some((ext) => name.toLowerCase().endsWith(ext));

  const dropProps = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      depth.current += 1;
      setIsDragOver(true);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragOver(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      depth.current = 0;
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      if (matches(file.name)) onFile(file);
      else onReject?.(file);
    },
  };

  return { isDragOver, dropProps };
}
