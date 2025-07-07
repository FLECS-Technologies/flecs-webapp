/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import { postImportApps } from '../ImportAppsService';
import { DeviceAPIConfiguration } from '../../api-config';

describe('postImportApps', () => {
  let originalXMLHttpRequest: typeof XMLHttpRequest;
  let mockXhr: any;
  let sendSpy: any;
  let openSpy: any;
  let setRequestHeaderSpy: any;

  beforeEach(() => {
    originalXMLHttpRequest = global.XMLHttpRequest;

    sendSpy = vi.fn();
    openSpy = vi.fn();
    setRequestHeaderSpy = vi.fn();

    mockXhr = {
      open: openSpy,
      setRequestHeader: setRequestHeaderSpy,
      send: sendSpy,
      readyState: 0,
      status: 0,
      responseText: 'success',
      onreadystatechange: null,
    };

    global.XMLHttpRequest = vi.fn(() => mockXhr) as any;
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXMLHttpRequest;
  });

  it('resolves when status is 202', async () => {
    const promise = postImportApps(new Blob(['test']), 'testfile.txt');
    // Simulate XHR readyState change
    mockXhr.status = 202;
    mockXhr.readyState = 4;
    setTimeout(() => {
      mockXhr.onreadystatechange && mockXhr.onreadystatechange();
    }, 0);
    await expect(promise).resolves.toBe('success');
    expect(openSpy).toHaveBeenCalledWith(
      'POST',
      DeviceAPIConfiguration.TARGET +
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.POST_IMPORT_URL,
      true,
    );
    expect(setRequestHeaderSpy).toHaveBeenCalledWith('Content-Disposition', 'testfile.txt');
    expect(sendSpy).toHaveBeenCalled();
  });

  it('rejects when status is not 202', async () => {
    const promise = postImportApps(new Blob(['test']), 'testfile.txt');
    mockXhr.status = 400;
    mockXhr.statusText = 'Bad Request';
    mockXhr.readyState = 4;
    setTimeout(() => {
      mockXhr.onreadystatechange && mockXhr.onreadystatechange();
    }, 0);
    await expect(promise).rejects.toBe('Bad Request');
  });
});
