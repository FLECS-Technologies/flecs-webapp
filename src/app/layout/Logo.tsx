import { useState } from 'react';
import type { CSSProperties } from 'react';
import { publicAssetPath } from '../../brandAssets';
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
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} style={style}>
        <FLECSLogo logoColor={logoColor} size={fallbackSize} />
      </span>
    );
  }
  return (
    <img
      src={publicAssetPath('logo.svg')}
      alt={alt}
      className={`block object-contain ${className}`}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
