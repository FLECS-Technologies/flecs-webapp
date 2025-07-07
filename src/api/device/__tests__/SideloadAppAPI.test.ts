/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Dec 14 2021
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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PostSideloadAppAPI from '../SideloadAppAPI';
import { DeviceAPIConfiguration } from '../../api-config';

// Mock BaseAPI with a callAPI method
vi.mock('../BaseAPI', () => {
  return {
    default: class {
      callAPI = vi.fn();
    },
  };
});

describe('PostSideloadAppAPI', () => {
  let api: PostSideloadAppAPI;

  beforeEach(() => {
    api = new PostSideloadAppAPI();
    (api as any).callAPI.mockReset();
  });

  it('calls callAPI with correct arguments', async () => {
    const yml = { foo: 'bar' };
    await api.sideloadApp(yml);
    expect((api as any).callAPI).toHaveBeenCalledWith(
      DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.POST_SIDELOAD_APP,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manifest: JSON.stringify(yml) }),
      },
    );
  });

  it('handles errors gracefully', async () => {
    (api as any).callAPI.mockRejectedValueOnce(new Error('fail'));
    await expect(api.sideloadApp({ foo: 'bar' })).resolves.toBeUndefined();
  });
});
