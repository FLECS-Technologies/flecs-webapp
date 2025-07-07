/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Wed Mar 29 2023
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
import Tooltip from '@mui/material/Tooltip';
import ReportOutlinedIcon from '@mui/icons-material/ReportOutlined';

const InfoIcon = (props) => {
  const { message } = props;
  return (
    <Tooltip title={message} style={{ width: '35px', height: '24px' }}>
      <ReportOutlinedIcon aria-label="info-button" outlined="true" sx={{ color: '#959595' }} />
    </Tooltip>
  );
};

InfoIcon.propTypes = {
  message: PropTypes.string,
};

export default InfoIcon;
