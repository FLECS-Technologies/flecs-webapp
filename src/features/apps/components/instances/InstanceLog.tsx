interface InstanceLogProps {
  text: string;
  loading: boolean;
  error?: string;
}

export default function InstanceLog({ text, loading, error }: InstanceLogProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3" data-testid="log-editor">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-error/25 bg-error/5 px-3 py-2 text-sm text-error"
        >
          {error}
        </div>
      )}
      <pre
        role="log"
        aria-busy={loading}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-surface p-4 font-mono text-sm leading-relaxed text-text-primary [scrollbar-gutter:stable]"
      >
        {loading && !text ? 'Loading log...' : text}
      </pre>
    </div>
  );
}
