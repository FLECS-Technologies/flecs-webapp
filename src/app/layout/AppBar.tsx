import { useState, useEffect } from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import { useUIStore } from '@stores/ui';
import FLECSLogo from './FLECSLogo';
import { brand } from '@app/theme/tokens';

export default function MobileBar() {
  const [isMobile, setIsMobile] = useState(false);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isMobile) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark border-b border-white/8">
      <div className="flex items-center gap-2 h-12 px-2">
        <button
          className="p-1.5 rounded-lg hover:bg-white/10 transition text-muted"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon size={22} />
        </button>
        <FLECSLogo logoColor={brand.primary} />
        <span className="text-sm font-bold text-white">FLECS</span>
      </div>
    </header>
  );
}
