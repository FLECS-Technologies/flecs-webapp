import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VersionSelector from '../VersionSelector';
import { Version } from '../../../models/version';

const mockVersions: Version[] = [
  { version: '1.0.0', installed: true },
  { version: '1.1.0', installed: false },
  {
    version: '2.0.0',
    installed: false,
    release_notes: 'http://release-notes.com',
    breaking_changes: 'http://breaking-changes.com',
  },
];

const mockSetSelectedVersion = jest.fn();

describe('VersionSelector', () => {
  it('renders without crashing with single version', () => {
    render(
      <VersionSelector
        availableVersions={[mockVersions[0]]}
        setSelectedVersion={mockSetSelectedVersion}
        selectedVersion={mockVersions[0]}
      />,
    );
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
  });

  it('renders multiple versions and selects a version', () => {
    render(
      <VersionSelector
        availableVersions={mockVersions}
        setSelectedVersion={mockSetSelectedVersion}
        selectedVersion={mockVersions[0]}
      />,
    );
    const autocomplete = screen.getByLabelText('Version');
    fireEvent.change(autocomplete, { target: { value: '1.1.0' } });
    fireEvent.click(screen.getByText('1.1.0'));
    expect(mockSetSelectedVersion).toHaveBeenCalledWith(mockVersions[1]);
  });

  it('shows release notes button when release notes are available', () => {
    render(
      <VersionSelector
        availableVersions={mockVersions}
        setSelectedVersion={mockSetSelectedVersion}
        selectedVersion={mockVersions[2]}
      />,
    );
    expect(screen.getByText('Release Notes')).toBeInTheDocument();
  });

  it('opens release notes link when release notes button is clicked', () => {
    window.open = jest.fn();
    render(
      <VersionSelector
        availableVersions={mockVersions}
        setSelectedVersion={mockSetSelectedVersion}
        selectedVersion={mockVersions[2]}
      />,
    );
    fireEvent.click(screen.getByText('Release Notes'));
    expect(window.open).toHaveBeenCalledWith('http://release-notes.com');
  });

  it('shows breaking changes button when breaking changes are available', () => {
    render(
      <VersionSelector
        availableVersions={mockVersions}
        setSelectedVersion={mockSetSelectedVersion}
        selectedVersion={mockVersions[2]}
      />,
    );
    expect(screen.getByText('Breaking Changes')).toBeInTheDocument();
  });

  it('opens breaking changes link when breaking changes button is clicked', () => {
    window.open = jest.fn();
    render(
      <VersionSelector
        availableVersions={mockVersions}
        setSelectedVersion={mockSetSelectedVersion}
        selectedVersion={mockVersions[2]}
      />,
    );
    fireEvent.click(screen.getByText('Breaking Changes'));
    expect(window.open).toHaveBeenCalledWith('http://breaking-changes.com');
  });
});
