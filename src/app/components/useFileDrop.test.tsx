/**
 * useFileDrop — unit tests via a minimal harness element.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFileDrop } from './useFileDrop';

function Harness(props: Parameters<typeof useFileDrop>[0]) {
  const { isDragOver, dropProps } = useFileDrop(props);
  return (
    <div data-testid="zone" data-dragover={isDragOver} {...dropProps}>
      drop here
    </div>
  );
}

const jsonFile = new File(['{}'], 'manifest.json', { type: 'application/json' });
const pngFile = new File(['x'], 'image.png', { type: 'image/png' });

describe('useFileDrop', () => {
  it('calls onFile for a matching extension', () => {
    const onFile = vi.fn();
    render(<Harness accept={['.json']} onFile={onFile} />);
    fireEvent.drop(screen.getByTestId('zone'), { dataTransfer: { files: [jsonFile] } });
    expect(onFile).toHaveBeenCalledWith(jsonFile);
  });

  it('calls onReject (not onFile) for a non-matching extension', () => {
    const onFile = vi.fn();
    const onReject = vi.fn();
    render(<Harness accept={['.json']} onFile={onFile} onReject={onReject} />);
    fireEvent.drop(screen.getByTestId('zone'), { dataTransfer: { files: [pngFile] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith(pngFile);
  });

  it('accepts any file when accept is omitted', () => {
    const onFile = vi.fn();
    render(<Harness onFile={onFile} />);
    fireEvent.drop(screen.getByTestId('zone'), { dataTransfer: { files: [pngFile] } });
    expect(onFile).toHaveBeenCalledWith(pngFile);
  });

  it('matches multi-part extensions like .tar.gz', () => {
    const onFile = vi.fn();
    const tarGz = new File(['x'], 'backup.tar.gz');
    render(<Harness accept={['.tar', '.tar.gz']} onFile={onFile} />);
    fireEvent.drop(screen.getByTestId('zone'), { dataTransfer: { files: [tarGz] } });
    expect(onFile).toHaveBeenCalledWith(tarGz);
  });

  it('tracks drag-over state across enter/leave, including nested elements', () => {
    render(<Harness accept={['.json']} onFile={vi.fn()} />);
    const zone = screen.getByTestId('zone');
    expect(zone.dataset.dragover).toBe('false');

    fireEvent.dragEnter(zone); // enter zone
    fireEvent.dragEnter(zone); // enter a child
    expect(zone.dataset.dragover).toBe('true');
    fireEvent.dragLeave(zone); // leave the child — still inside zone
    expect(zone.dataset.dragover).toBe('true');
    fireEvent.dragLeave(zone); // leave zone
    expect(zone.dataset.dragover).toBe('false');
  });

  it('resets drag-over state after a drop', () => {
    render(<Harness accept={['.json']} onFile={vi.fn()} />);
    const zone = screen.getByTestId('zone');
    fireEvent.dragEnter(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [jsonFile] } });
    expect(zone.dataset.dragover).toBe('false');
  });

  it('ignores everything when disabled', () => {
    const onFile = vi.fn();
    render(<Harness accept={['.json']} onFile={onFile} disabled />);
    const zone = screen.getByTestId('zone');
    fireEvent.dragEnter(zone);
    expect(zone.dataset.dragover).toBe('false');
    fireEvent.drop(zone, { dataTransfer: { files: [jsonFile] } });
    expect(onFile).not.toHaveBeenCalled();
  });
});
