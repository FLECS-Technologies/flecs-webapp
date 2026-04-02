import Logo from '@assets/images/logo.svg?react';

export default function FLECSLogo({ logoColor }: { logoColor?: string }) {
  return (
    <Logo
      width="24"
      height="24"
      style={{ color: logoColor || '#FF2E63' }}
    />
  );
}
