/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Sep 12 2025
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

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import axios from 'axios';
import MarketplaceAuthService from '../MarketplaceAuthService';
import { MarketplaceAPIConfiguration } from '../../api-config';
import type { MarketplaceUser, MarketplaceValidation } from '../../../models/marketplace';

// Mock axios
vi.mock('axios');

// Mock the API configuration
vi.mock('../../api-config', () => ({
  MarketplaceAPIConfiguration: {
    MP_PROXY_URL: 'https://api.flecs.tech',
    POST_AUTHENTICATE_URL: '/api/v2/auth/login',
    POST_VALIDATE_URL: '/api/v2/auth/validate',
  },
}));

const mockedAxios = axios as any;

describe('MarketplaceAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser: MarketplaceUser = {
        ID: 123,
        user_login: 'testuser',
        user_nicename: 'Test User',
        display_name: 'Test User',
        user_url: 'https://example.com',
        user_email: 'test@example.com',
        user_registered: '2022-01-13 08:43:14',
        jwt: {
          token: 'mock-jwt-token',
          token_expires: 1642255418,
        },
        feature_flags: {
          isVendor: false,
          isWhitelabeled: true,
        },
      };

      const mockResponse = {
        data: {
          statusCode: 200,
          data: mockUser,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const username = 'testuser';
      const password = 'testpassword';

      const result = await MarketplaceAuthService.login(username, password);

      expect(mockedAxios.post).toHaveBeenCalledWith('https://api.flecs.tech/api/v2/auth/login', {
        username,
        password,
        issueJWT: true,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when login response has no JWT token', async () => {
      const mockResponse = {
        data: {
          statusCode: 200,
          data: {
            ID: 123,
            user_login: 'testuser',
            // Missing jwt property
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(MarketplaceAuthService.login('testuser', 'testpassword')).rejects.toThrow(
        'Invalid login response',
      );
    });

    it('should throw error when login response has invalid status code', async () => {
      const mockResponse = {
        data: {
          statusCode: 401,
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(MarketplaceAuthService.login('testuser', 'wrongpassword')).rejects.toThrow(
        'Invalid login response',
      );
    });

    it('should throw error when axios request fails', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(MarketplaceAuthService.login('testuser', 'testpassword')).rejects.toThrow(
        'Network Error',
      );
    });

    it('should handle server error responses', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal Server Error',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(serverError);

      await expect(MarketplaceAuthService.login('testuser', 'testpassword')).rejects.toEqual(
        serverError,
      );
    });

    it('should handle unauthorized error responses', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            statusCode: 401,
            message: 'Unauthorized',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(unauthorizedError);

      await expect(MarketplaceAuthService.login('testuser', 'wrongpassword')).rejects.toEqual(
        unauthorizedError,
      );
    });
  });

  describe('validate', () => {
    it('should successfully validate a valid token', async () => {
      const mockValidation: MarketplaceValidation = {
        iat: 1642150000,
        iss: 'https://api.flecs.tech',
        exp: 1642255418,
        jti: 'mock-jti',
        userId: 123,
        revocable: true,
        refreshable: true,
        isValid: true,
      };

      const mockResponse = {
        data: {
          statusCode: 200,
          data: mockValidation,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const token = 'mock-jwt-token';
      const result = await MarketplaceAuthService.validate(token);

      expect(mockedAxios.post).toHaveBeenCalledWith('https://api.flecs.tech/api/v2/auth/validate', {
        jwt: { token },
      });
      expect(result).toEqual(mockValidation);
    });

    it('should throw error when validation response indicates invalid token', async () => {
      const mockResponse = {
        data: {
          statusCode: 200,
          data: {
            isValid: false,
            message: 'Token is expired',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(MarketplaceAuthService.validate('expired-token')).rejects.toThrow(
        'Invalid validation response',
      );
    });

    it('should throw error when validation response has invalid status code', async () => {
      const mockResponse = {
        data: {
          statusCode: 401,
          data: {
            message: 'Unauthorized',
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(MarketplaceAuthService.validate('invalid-token')).rejects.toThrow(
        'Invalid validation response',
      );
    });

    it('should throw error when axios request fails', async () => {
      const networkError = new Error('Network timeout');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(MarketplaceAuthService.validate('some-token')).rejects.toThrow(
        'Network timeout',
      );
    });

    it('should handle server error responses', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal Server Error',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(serverError);

      await expect(MarketplaceAuthService.validate('some-token')).rejects.toEqual(serverError);
    });

    it('should handle malformed validation responses', async () => {
      const mockResponse = {
        data: {
          statusCode: 200,
          data: {
            // Missing isValid property
            iat: 1642150000,
            exp: 1642255418,
          },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(MarketplaceAuthService.validate('malformed-token')).rejects.toThrow(
        'Invalid validation response',
      );
    });
  });

  describe('service instance', () => {
    it('should be a singleton instance', () => {
      const service1 = MarketplaceAuthService;
      const service2 = MarketplaceAuthService;
      expect(service1).toBe(service2);
    });

    it('should have login method', () => {
      expect(typeof MarketplaceAuthService.login).toBe('function');
    });

    it('should have validate method', () => {
      expect(typeof MarketplaceAuthService.validate).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle empty username and password', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Bad Request'));

      await expect(MarketplaceAuthService.login('', '')).rejects.toThrow('Bad Request');
    });

    it('should handle empty token validation', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Bad Request'));

      await expect(MarketplaceAuthService.validate('')).rejects.toThrow('Bad Request');
    });

    it('should handle null response data', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: null });

      await expect(MarketplaceAuthService.login('test', 'test')).rejects.toThrow();
    });
  });
});
