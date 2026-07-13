import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { themingAssetPath } from '../../brandAssets';
import { useDarkMode } from '@app/theme/ThemeHandler';
import { useTenant } from '@app/theme/TenantContext';
import FLECSLogo from './FLECSLogo';

interface Props {
  alt?: string;
  className?: string;
  fallbackSize?: number;
  logoColor?: string;
  style?: CSSProperties;
}

export default function Logo({
  alt = '',
  className = 'h-6 w-6',
  fallbackSize = 24,
  logoColor = 'var(--color-brand)',
  style,
}: Props) {
  const { branding } = useTenant();
  const { isDarkMode } = useDarkMode();
  const defaultLogo = branding.logos.default ?? 'logo.svg';
  const modeLogo = isDarkMode ? branding.logos.dark : branding.logos.light;
  const preferredLogo = modeLogo ?? defaultLogo;
  const [src, setSrc] = useState(preferredLogo);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(preferredLogo);
    setFailed(false);
  }, [preferredLogo]);

  if (failed) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} style={style}>
        <FLECSLogo logoColor={logoColor} size={fallbackSize} />
      </span>
    );
  }
  return (
    <img
      src={themingAssetPath(src)}
      alt={alt}
      className={`block object-contain ${className}`}
      style={style}
      onError={() => {
        if (src !== defaultLogo) {
          setSrc(defaultLogo);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
