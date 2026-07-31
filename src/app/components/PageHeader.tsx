import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <header className={`mb-7 ${className}`}>
      <h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-1.5 text-sm text-muted">{description}</p>
    </header>
  );
}
