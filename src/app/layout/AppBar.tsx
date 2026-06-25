import { useState, useEffect } from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import { useUIStore } from '@stores/ui';
import Logo from './Logo';
import { useTenant } from '@app/theme/TenantContext';

export default function MobileBar() {
  const [isMobile, setIsMobile] = useState(false);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { app_title, branding } = useTenant();
  const showAppTitle = branding.show_app_title;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isMobile) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border">
      <div className="flex items-center gap-2 h-12 px-2">
        <button
          className="p-1.5 rounded-lg hover:bg-surface-hover transition text-muted"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon size={22} />
        </button>
        <Logo
          alt={showAppTitle ? '' : `${app_title} logo`}
          className={
            showAppTitle
              ? 'h-6 w-6 shrink-0'
              : 'h-7 w-auto max-w-[var(--brand-logo-mobile-max-width)] shrink-0'
          }
          fallbackSize={showAppTitle ? 24 : 28}
          style={showAppTitle ? undefined : { maxHeight: 'var(--brand-logo-mobile-max-height)' }}
        />
        {showAppTitle && <span className="text-sm font-bold text-text-primary">{app_title}</span>}
      </div>
    </header>
  );
}
