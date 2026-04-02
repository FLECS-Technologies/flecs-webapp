import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QuestIcon } from '../components/QuestIcon';
import { QuestState } from '@flecs/core-client-ts';

vi.mock('lucide-react', () => ({
  __esModule: true,
  AlertCircle: (props: any) => <div data-testid="error-icon" {...props} />,
  CheckCircle2: (props: any) => <div data-testid="success-icon" {...props} />,
  Hourglass: (props: any) => <div data-testid="pending-icon" {...props} />,
  Ban: (props: any) => <div data-testid="skipped-icon" {...props} />,
}));

describe('QuestIcon Component', () => {
  afterEach(() => { vi.resetAllMocks(); });

  it('renders error icon for Failed and Failing states', () => {
    render(<QuestIcon state={QuestState.Failed} />);
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    cleanup();
    render(<QuestIcon state={QuestState.Failing} />);
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('renders success icon for Success state', () => {
    render(<QuestIcon state={QuestState.Success} />);
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });

  it('renders pending icon for Pending state', () => {
    render(<QuestIcon state={QuestState.Pending} />);
    expect(screen.getByTestId('pending-icon')).toBeInTheDocument();
  });

  it('renders skipped icon for Skipped state', () => {
    render(<QuestIcon state={QuestState.Skipped} />);
    expect(screen.getByTestId('skipped-icon')).toBeInTheDocument();
  });

  it('renders spinner for unknown/default state', () => {
    const { container } = render(<QuestIcon state={QuestState.Ongoing} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
