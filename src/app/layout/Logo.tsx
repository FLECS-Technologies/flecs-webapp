import { useState } from 'react';
import FLECSLogo from './FLECSLogo';
import { appBasePath } from '../../base-path';

interface Props {
  logoColor?: string;
  // Tailwind sizing for the <img>, set per UI slot by the call site (app bar,
  // full-height sidebar wordmark, collapsed rail).
  className?: string;
}

export default function Logo({
  logoColor = 'var(--color-brand)',
  className = 'h-6 w-auto',
}: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FLECSLogo logoColor={logoColor} />;
  return (
    <img
      src={`${appBasePath()}logo.svg`}
      alt="logo"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
