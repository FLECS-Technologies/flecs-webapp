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
import React from 'react'
import { Box, Button, Tooltip } from '@mui/material'
import { TransportProtocol } from 'core-client/api'
import { SwapHoriz } from '@mui/icons-material'

interface AddPortRangeMappingButtonProps {
  onAdd: (protocol: TransportProtocol) => void
  defaultProtocol: TransportProtocol
}

const AddPortRangeMappingButton: React.FC<AddPortRangeMappingButtonProps> = ({
  onAdd,
  defaultProtocol
}) => {
  const handleAdd = () => {
    onAdd(defaultProtocol)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Tooltip title='Add a range of ports (e.g., 8000–8010:8000-8010)'>
        <span>
          <Button
            onClick={handleAdd}
            variant='text'
            color='secondary'
            startIcon={<SwapHoriz />}
          >
            Add Port Range Mapping
          </Button>
        </span>
      </Tooltip>
    </Box>
  )
}

export default AddPortRangeMappingButton
