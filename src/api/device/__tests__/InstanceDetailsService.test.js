/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
import '@testing-library/dom';
import { waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { getHostname, getIPAddress, getPorts } from '../InstanceDetailsService';
import { vitest } from 'vitest';

vitest.mock('axios');

const mockDetails = {
  data: {
    additionalInfo: 'string',
    app: 'tech.flecs.app',
    conffiles: [
      {
        container: '/etc/conf.d/configuration.cfg',
        host: '/var/lib/flecs/instances/0123abcd/conf/configuration.cfg',
      },
    ],
    hostname: 'flecs-0123abcd',
    instanceId: '87654fed',
    ipAddress: '172.21.0.2',
    mounts: [
      {
        container: '/path/to/dir',
        host: '/path/to/host/dir',
      },
    ],
    ports: [
      {
        container: '8080',
        host: '18080',
      },
    ],
    version: 'v4.0.6',
    volumes: [
      {
        name: 'var',
        path: '/var/app',
      },
    ],
  },
};

describe('InstanceDetailsService', () => {
  beforeAll(() => {
    axios.post = vitest.fn();
  });

  afterAll(() => {
    vitest.clearAllMocks();
  });

  test('Get IP Address from Details', () => {
    const ip = getIPAddress(mockDetails.data);
    expect(ip).toBe(mockDetails.data.ipAddress);
  });

  test('Get host from Details', () => {
    const host = getHostname(mockDetails.data);
    expect(host).toBe(mockDetails.data.hostname);
  });

  test('Get ports from Details', () => {
    const ports = getPorts(mockDetails.data);
    expect(ports).toHaveLength(1);
  });
});
