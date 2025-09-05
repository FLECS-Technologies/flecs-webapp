import React from 'react';
import nock from 'nock';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';
import { SystemContextProvider } from '../../data/SystemProvider';
import { SystemData } from '../../data/SystemData';
import { vitest } from 'vitest';

vitest.mock('../../api/device/DeviceAuthAPI');
vitest.mock('../../api/device/license/activation');
vitest.mock('../../api/device/license/status');

describe('Card', () => {
  beforeEach(() => {
    nock.disableNetConnect();
    nock.enableNetConnect(['127.0.0.1']);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  afterAll(() => {
    vitest.clearAllMocks();
  });

  test('renders Card component', async () => {
    await waitFor(() => {
      render(<Card />);
    });

    expect(screen.getByTestId('app-card')).toBeInTheDocument();
  });

  test('Click request', async () => {
    render(<Card />);

    const requestButton = await waitFor(() => screen.getByTestId('app-request-button'));
    expect(requestButton).toBeVisible();
    expect(requestButton).toBeEnabled();

    fireEvent.click(requestButton);
  });

  test('Click install', async () => {
    await waitFor(() =>
      render(
        <SystemContextProvider>
          <SystemData>
            <Card
              app="Testapp"
              avatar=""
              title="Test App Title"
              author="Test App author"
              versions={['Test App Version']}
              description="Test App Description"
              status="uninstalled"
              availability="available"
              requirement={['amd64']} // valid architecture
              installedVersions={[]}
              instances={[]}
            />
          </SystemData>
        </SystemContextProvider>,
      ),
    );

    const installButton = await waitFor(() => screen.getByLabelText('install-app-button'));
    const uninstallButton = screen.queryByText('Uninstall');
    const requestButton = screen.getByTestId('app-request-button');

    expect(installButton).toBeVisible();
    expect(installButton).toBeEnabled();
    expect(uninstallButton).toBeNull();
    expect(requestButton).not.toBeVisible();
  });

  test('Click uninstall', async () => {
    await waitFor(() =>
      render(
        <Card
          app="Testapp"
          avatar=""
          title="Test App Title"
          author="Test App author"
          version="Test App Version"
          description="Test App Description"
          status="installed"
          availability="available"
          installedVersions={['Test App Version']}
          instances={[]}
        />,
      ),
    );

    const uninstallButton = await waitFor(() => screen.getByText('Uninstall'));
    fireEvent.click(uninstallButton);
  });

  test('Card with documentation url', async () => {
    render(<Card documentationUrl="https://google.com" />);

    const helpCenterIcon = await waitFor(() => screen.getByTestId('HelpCenterIcon'));
    expect(helpCenterIcon).toBeVisible();
  });

  test('Card without documentation url', async () => {
    render(<Card />);

    await waitFor(() => {
      expect(() => screen.getByTestId('HelpCenterIcon')).toThrow();
    });
  });
});
