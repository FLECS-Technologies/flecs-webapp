import Logo from '@assets/images/logo.svg?react';

export const useWhiteLabelLogo = false;
export const showPoweredBy = true;

export default function WhiteLabelLogo({ logoColor }: { logoColor?: string }) {
  return (
    <Logo
      width="128"
      height="48"
      style={{ color: logoColor || '#FF2E63' }}
    />
  );
}
