/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Apr 16 2025
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
import { Select, MenuItem } from '@mui/material';
import { TransportProtocol } from '@flecs/core-client-ts';

interface TransportProtocolSelectorProps {
  value: TransportProtocol;
  onChange: (protocol: TransportProtocol) => void;
  label?: string;
  sx?: object;
}

const TransportProtocolSelector: React.FC<TransportProtocolSelectorProps> = ({
  value,
  onChange,
  sx = {},
}) => {
  return (
    <Select
      aria-label="Transport Protocol"
      value={value}
      onChange={(e) => onChange(e.target.value as TransportProtocol)}
      size="small"
    >
      <MenuItem value={TransportProtocol.Tcp}>TCP</MenuItem>
      <MenuItem value={TransportProtocol.Udp}>UDP</MenuItem>
    </Select>
  );
};

export default TransportProtocolSelector;
