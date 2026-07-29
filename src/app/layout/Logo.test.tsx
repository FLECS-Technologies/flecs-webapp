import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TenantConfigSchema } from '../../tenant';
import { TenantContext } from '@app/theme/TenantContext';
import { ThemeHandler } from '@app/theme/ThemeHandler';
import Logo from './Logo';

beforeEach(() => {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
});

function renderLogo(tenant = TenantConfigSchema.parse({})) {
  return render(
    <TenantContext.Provider value={tenant}>
      <ThemeHandler>
        <Logo alt="Brand logo" />
      </ThemeHandler>
    </TenantContext.Provider>,
  );
}

describe('Logo', () => {
  it('renders the built-in FLECS mark immediately when no themed logo is configured', () => {
    const { container } = renderLogo();

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Brand logo' })).toBeVisible();
    expect(container.querySelector('svg')).toBeVisible();
  });

  it('loads an explicitly configured themed logo', () => {
    renderLogo(
      TenantConfigSchema.parse({
        branding: { logos: { default: 'custom-logo.svg' } },
      }),
    );

    expect(screen.getByRole('img', { name: 'Brand logo' })).toHaveAttribute(
      'src',
      '/theming/custom-logo.svg',
    );
  });
});
