/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Jan 13 2022
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
import axios from 'axios';
import { MarketplaceAPIConfiguration } from '../api-config';
import { MarketplaceUser, MarketplaceValidation } from '../../models/marketplace';

class MarketplaceAuthService {
  async login(username: string, password: string): Promise<MarketplaceUser> {
    const issueJWT = true;
    const url =
      MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL;
    try {
      const response = await axios.post(url, {
        username,
        password,
        issueJWT,
      });
      if (response.data.statusCode === 200 && response.data.data?.jwt?.token) {
        return response.data.data as MarketplaceUser;
      }
      throw new Error('Invalid login response');
    } catch (error: any) {
      throw error;
    }
  }

  async validate(token: string): Promise<MarketplaceValidation> {
    const jwt = { token };
    const url =
      MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.POST_VALIDATE_URL;
    try {
      const response = await axios.post(url, { jwt });
      if (response.data.statusCode === 200 && response.data.data.isValid) {
        return response.data.data as MarketplaceValidation;
      }
      throw new Error('Invalid validation response');
    } catch (error: any) {
      throw error;
    }
  }
}

export default new MarketplaceAuthService();
