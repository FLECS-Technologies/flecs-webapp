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
import React from 'react';
import PropTypes from 'prop-types';
import { getHostname, getIPAddress } from '../api/device/InstanceDetailsService';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CollapsableRow from './ui/CollapsableRow';
import VolumesTable from './VolumesTable';
import HostContainerTable from './HostContainerTable';
import { useProtectedApi } from '@contexts/api/ApiProvider';

export default function InstanceDetails(props) {
  const { instance } = props;
  const executedRef = React.useRef(false);
  const api = useProtectedApi();
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [reloadDetails, setReloadDetails] = React.useState(false);
  const [networkDetails, setNetworkDetails] = React.useState([]);
  const [instanceDetails, setInstanceDetails] = React.useState();

  function createData(name, info) {
    return { name, info };
  }

  function createNetworkDetails(instanceDetails) {
    const tmpnetworkDetails = [
      createData('IP Address', getIPAddress(instanceDetails)),
      createData('Hostname', getHostname(instanceDetails)),
    ];
    setNetworkDetails(tmpnetworkDetails);
  }

  React.useEffect(() => {
    if (executedRef.current) {
      return;
    }
    if (!loadingDetails) {
      fetchDetails();
    }
    if (reloadDetails) {
      setReloadDetails(false);
    }
    executedRef.current = true;
  }, [reloadDetails]);

  const fetchDetails = async (props) => {
    setLoadingDetails(true);

    api.instances
      .instancesInstanceIdGet(instance.instanceId)
      .then((response) => {
        createNetworkDetails(response.data);
        setInstanceDetails(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  };

  return (
    <TableContainer aria-label="instance-details-container">
      {networkDetails.length > 0 && (
        <Table sx={{ minWidth: 650 }} aria-label="network info table">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="h6">Network information</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {networkDetails.map((row) => (
              <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" style={{ borderBottom: 'none' }}>
                  {row.name}
                </TableCell>
                <TableCell style={{ borderBottom: 'none' }}>{row.info}</TableCell>
              </TableRow>
            ))}
            {instanceDetails?.ports?.length > 0 && (
              <CollapsableRow title="Ports">
                <HostContainerTable data={instanceDetails?.ports}></HostContainerTable>
              </CollapsableRow>
            )}
          </TableBody>
        </Table>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>
              <Typography variant="h6">Storage</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instanceDetails?.volumes?.length > 0 && (
            <CollapsableRow title="Volumes">
              <VolumesTable volumes={instanceDetails?.volumes}></VolumesTable>
            </CollapsableRow>
          )}
          {instanceDetails?.conffiles?.length > 0 && (
            <CollapsableRow title="Configuration Files">
              <HostContainerTable data={instanceDetails?.conffiles}></HostContainerTable>
            </CollapsableRow>
          )}
          {instanceDetails?.mounts?.length > 0 && (
            <CollapsableRow title="Mounts">
              <HostContainerTable data={instanceDetails?.mounts}></HostContainerTable>
            </CollapsableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

InstanceDetails.propTypes = {
  instance: PropTypes.object,
};
