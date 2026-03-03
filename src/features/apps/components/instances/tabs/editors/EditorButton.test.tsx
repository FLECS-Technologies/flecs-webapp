/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed May 15 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EditorButton } from '@shared/components/app-actions/editors/EditorButton';
import { AppInstance } from '@shared/api/instances';

const testInstance: AppInstance = {
  editors: [{ name: 'Editor 1', url: '/editor', supportsReverseProxy: false, port: 80 }],
  appKey: { name: 'com.test.app', version: '1.1.0' },
  desired: 'running',
  status: 'running',
  instanceId: '1234',
  instanceName: 'testInstance',
};

describe('OpenEditorButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
    window.open = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('opens editor URL in new window on button click in development environment', () => {
    vi.stubEnv('VITE_APP_ENVIRONMENT', 'development');
    vi.stubEnv('VITE_APP_DEV_CORE_URL', 'http://localhost:3000');
    render(<EditorButton editor={testInstance.editors[0]} index={0} />);
    fireEvent.click(screen.getByLabelText('open-editor-button-0'));
    expect(window.open).toHaveBeenCalledWith('http://localhost:3000/api/editor');
  });

  it('opens editor URL in new window on button click in production environment', () => {
    vi.stubEnv('VITE_APP_ENVIRONMENT', 'production');
    vi.stubEnv('VITE_APP_DEV_CORE_URL', '');
    render(<EditorButton editor={testInstance.editors[0]} index={0} />);
    fireEvent.click(screen.getByLabelText('open-editor-button-0'));
    expect(window.open).toHaveBeenCalledWith(`http://${window.location.hostname}:3000/api/editor`);
  });
});
