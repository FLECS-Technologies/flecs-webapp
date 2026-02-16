import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProviderStep } from '../AuthProviderStep';

import { createMockApi, setupAuthProviderConfigured } from '../../../../__mocks__/core-client-ts';
import * as QuestContextModule from '@contexts/quests/QuestContext';

// Mock the ApiProvider hook to use the central mock
const mockUsePublicApi = vi.fn();
vi.mock('@contexts/api/ApiProvider', () => ({
  usePublicApi: () => mockUsePublicApi(),
}));

// Provide a minimal QuestProvider context for the component
const MockQuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Provide only the minimal context needed for AuthProviderStep
  const questContextValue = {
    quests: { current: new Map() },
    mainQuestIds: [],
    fetchQuest: vi.fn(),
    fetchQuests: vi.fn(),
    setFetching: vi.fn(),
    fetching: false,
    clearQuests: vi.fn(),
    waitForQuest: vi.fn(),
    waitForQuests: vi.fn(),
  };
  return (
    <QuestContextModule.QuestContext.Provider value={questContextValue}>
      {children}
    </QuestContextModule.QuestContext.Provider>
  );
};

describe('AuthProviderStep', () => {
  let mockApi: any;
  let mockProps: any;
  const AuthProviderStepComponent = new AuthProviderStep().component;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUsePublicApi.mockReturnValue(mockApi);
    mockProps = {
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      onComplete: vi.fn(),
      isLoading: false,
      error: undefined,
    };
  });

  it('shows loading state initially', () => {
    render(
      <MockQuestProvider>
        <AuthProviderStepComponent {...mockProps} />
      </MockQuestProvider>,
    );
    expect(screen.getByText(/Checking authentication provider status/i)).toBeInTheDocument();
  });

  it('shows error if error prop is provided', () => {
    render(
      <MockQuestProvider>
        <AuthProviderStepComponent {...mockProps} error="Test error" />
      </MockQuestProvider>,
    );
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('calls onPrevious when Previous is clicked in error state', async () => {
    render(
      <MockQuestProvider>
        <AuthProviderStepComponent {...mockProps} error="Test error" />
      </MockQuestProvider>,
    );
    const previousButton = screen.getByRole('button', { name: /Previous/i });
    fireEvent.click(previousButton);
    expect(mockProps.onPrevious).toHaveBeenCalled();
  });
});
