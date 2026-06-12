import { useState } from 'react';
import FLECSLogo from './FLECSLogo';

interface Props {
  logoColor?: string;
}

export default function Logo({ logoColor = 'var(--color-brand)' }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FLECSLogo logoColor={logoColor} />;
  return <img src="/logo.svg" alt="logo" width={24} height={24} onError={() => setFailed(true)} />;
}
