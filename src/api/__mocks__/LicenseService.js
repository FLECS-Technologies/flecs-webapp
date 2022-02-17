/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 17 2022
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

function getCurrentUserLicenses () {
  return new Promise((resolve, reject) => {
    resolve([{
      license_id: '5',
      product_id: '122',
      variation_id: '0',
      license_key: 'XXXX-XXXX-XXXX-XXXX',
      image_license_key: null,
      license_status: 'sold',
      owner_first_name: 'Development',
      owner_last_name: 'Customer',
      activation_date: null,
      creation_date: '2022-02-16',
      expiration_date: null,
      valid: '0',
      sold_date: '2022-02-16',
      product_name: 'App Installation Ticket',
      variation_name: '',
      delivery_limit: '0',
      remaining_delivery_times: '0',
      activation_limit: '1',
      remaining_activations: '1',
      device_ids: [],
      license_key_meta: []
    },
    {
      license_id: '4',
      product_id: '122',
      variation_id: '0',
      license_key: 'AAAA-AAAA-AAAA-AAAA',
      image_license_key: null,
      license_status: 'sold',
      owner_first_name: 'Development',
      owner_last_name: 'Customer',
      activation_date: null,
      creation_date: '2022-02-16',
      expiration_date: null,
      valid: '0',
      sold_date: '2022-02-16',
      product_name: 'App Installation Ticket',
      variation_name: '',
      delivery_limit: '0',
      remaining_delivery_times: '0',
      activation_limit: '1',
      remaining_activations: '1',
      device_ids: [],
      license_key_meta: []
    },
    {
      license_id: '3',
      product_id: '122',
      variation_id: '0',
      license_key: 'YYYY-YYYY-YYYY-YYYY',
      image_license_key: null,
      license_status: 'sold',
      owner_first_name: 'Development',
      owner_last_name: 'Customer',
      activation_date: null,
      creation_date: '2022-02-16',
      expiration_date: null,
      valid: '0',
      sold_date: '2022-02-16',
      product_name: 'App Installation Ticket',
      variation_name: '',
      delivery_limit: '0',
      remaining_delivery_times: '0',
      activation_limit: '1',
      remaining_activations: '1',
      device_ids: [],
      license_key_meta: []
    }])
  })
}

export { getCurrentUserLicenses }
