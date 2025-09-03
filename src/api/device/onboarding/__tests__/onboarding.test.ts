import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { OnboardingDeviceAPI } from '../onboarding';
import { createApi } from '../../../flecs-core/api-client';

vi.mock('axios');
const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };

function createMockFile(content: string): File {
  return {
    text: vi.fn().mockResolvedValue(content),
  } as unknown as File;
}

function createMockApi(): ReturnType<typeof createApi> {
  return {
    device: {
      deviceOnboardingPost: vi.fn(),
    },
  } as any;
}

describe('OnboardingDeviceAPI', () => {
  let mockApi: ReturnType<typeof createApi>;

  beforeEach(() => {
    mockedAxios.post = vi.fn();
    mockApi = createMockApi();
  });

  it('should post parsed file content and return response data', async () => {
    const fileContent = JSON.stringify({ foo: 'bar' });
    const file = createMockFile(fileContent);
    const response = { jobId: 123 };

    (mockApi.device.deviceOnboardingPost as any).mockResolvedValueOnce({ data: response });

    const result = await OnboardingDeviceAPI(file, mockApi);
    expect(file.text).toHaveBeenCalled();
    expect(mockApi.device.deviceOnboardingPost).toHaveBeenCalledWith({ foo: 'bar' });
    expect(result).toEqual(response);
  });

  it('should reject if api call fails', async () => {
    const fileContent = JSON.stringify({ foo: 'bar' });
    const file = createMockFile(fileContent);
    (mockApi.device.deviceOnboardingPost as any).mockRejectedValueOnce(new Error('fail'));

    await expect(OnboardingDeviceAPI(file, mockApi)).rejects.toThrow('fail');
  });

  it('should reject if file content is invalid JSON', async () => {
    const file = createMockFile('not-json');
    await expect(OnboardingDeviceAPI(file, mockApi)).rejects.toThrow();
  });
});
