import { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  footerAction?: ReactNode;
  danger?: boolean;
  children?: ReactNode;
}

export default function SettingsCard({
  title,
  description,
  footer,
  footerAction,
  danger,
  children,
}: SettingsCardProps) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        danger ? 'border-error' : 'border-white/10'
      }`}
    >
      {/* Content */}
      <div className={`px-6 pt-6 ${children ? 'pb-6' : 'pb-4'}`}>
        <h6 className="text-[1.1rem] font-bold">{title}</h6>
        {description && (
          <p className="text-sm text-muted mt-1.5">{description}</p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>

      {/* Footer */}
      {(footer || footerAction) && (
        <div
          className={`flex items-center px-6 py-3.5 border-t ${
            danger
              ? 'border-error bg-error/5'
              : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          {footer && (
            <span className="flex-1 text-xs text-muted">{footer}</span>
          )}
          {footerAction}
        </div>
      )}
    </div>
  );
}
