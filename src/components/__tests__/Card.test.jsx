import React from 'react';
import nock from 'nock';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';
import { SystemContextProvider } from '../../data/SystemProvider';
import { SystemData } from '../../data/SystemData';
import { JobsContextProvider } from '../../data/JobsContext';
import { vitest } from 'vitest';

vitest.mock('../../api/device/JobsAPI');
vitest.mock('../../api/device/AppAPI');
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
      render(
        <JobsContextProvider>
          <Card />
        </JobsContextProvider>,
      );
    });

    expect(screen.getByTestId('app-card')).toBeInTheDocument();
  });

  test('Click request', async () => {
    render(
      <JobsContextProvider>
        <Card />
      </JobsContextProvider>,
    );

    const requestButton = await waitFor(() => screen.getByTestId('app-request-button'));
    expect(requestButton).toBeVisible();
    expect(requestButton).toBeEnabled();

    fireEvent.click(requestButton);
  });

  test('Click install', async () => {
    await waitFor(() =>
      render(
        <JobsContextProvider>
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
          </SystemContextProvider>
        </JobsContextProvider>,
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
        <JobsContextProvider>
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
          />
        </JobsContextProvider>,
      ),
    );

    const uninstallButton = await waitFor(() => screen.getByText('Uninstall'));
    fireEvent.click(uninstallButton);
  });

  test('Card with documentation url', async () => {
    render(
      <JobsContextProvider>
        <Card documentationUrl="https://google.com" />
      </JobsContextProvider>,
    );

    const helpCenterIcon = await waitFor(() => screen.getByTestId('HelpCenterIcon'));
    expect(helpCenterIcon).toBeVisible();
  });

  test('Card without documentation url', async () => {
    render(
      <JobsContextProvider>
        <Card />
      </JobsContextProvider>,
    );

    await waitFor(() => {
      expect(() => screen.getByTestId('HelpCenterIcon')).toThrow();
    });
  });
});
