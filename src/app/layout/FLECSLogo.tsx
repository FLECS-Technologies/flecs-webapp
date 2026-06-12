import Logo from '@assets/images/logo.svg?react';

export default function FLECSLogo({ logoColor, size = 24 }: { logoColor?: string; size?: number }) {
  return <Logo width={size} height={size} style={{ color: logoColor || '#FF2E63' }} />;
}
