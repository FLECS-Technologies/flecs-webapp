/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 11 2022
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
import React from 'react';
import PropTypes from 'prop-types';
import { useSystemContext } from '@contexts/data/SystemProvider';
import { useProtectedApi } from '@contexts/api/ApiProvider';
import { useDeviceState } from '@contexts/device/DeviceStateProvider';

function SystemData(props) {
  const context = useSystemContext();
  const { setPing, loading, setLoading, setSystemInfo } = context || {};
  const [loadingSystemInfo, setLoadingSystemInfo] = React.useState(false);
  const api = useProtectedApi();
  const { authenticated } = useDeviceState();

  React.useEffect(() => {
    // Only proceed if context functions are available
    if (!setPing || !setLoading) return;

    // Only fetch once when component mounts
    if (!loading) fetchPing();
  }, []);

  React.useEffect(() => {
    // Fetch after authentication
    if (!loadingSystemInfo && authenticated) fetchSystemInfo();
  }, [authenticated]);

  // Add defensive check - don't run effects if context functions are not available
  if (!setPing || !setLoading || !setSystemInfo) {
    return <>{props.children}</>;
  }

  const fetchPing = async () => {
    setLoading(true);
    api.system
      .systemPingGet()
      .then(() => {
        setPing(true);
      })
      .catch(() => {
        setPing(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchSystemInfo = async () => {
    setLoadingSystemInfo(true);
    api.system
      .systemInfoGet()
      .then((response) => {
        setSystemInfo(response.data);
      })
      .catch((error) => {
        console.log(error);
        setSystemInfo(undefined);
      })
      .finally(() => {
        setLoadingSystemInfo(false);
      });
  };

  return <>{props.children}</>;
}
SystemData.propTypes = {
  children: PropTypes.any,
};
export { SystemData };
