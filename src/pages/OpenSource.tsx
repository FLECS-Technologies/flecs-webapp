/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Mar 30 2022
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

import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import openSourceTxt from '../assets/third-party-licenses.txt';

export default function OpenSource() {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch(openSourceTxt)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load open source licenses.');
        }
        return response.text();
      })
      .then(setContent)
      .catch(() => setContent('Could not load open source licenses.'));
  }, []);

  return (
    <>
      <Typography variant="h4">Open Source</Typography>
      <Typography aria-label="licenses" sx={{ whiteSpace: 'pre-wrap', textAlign: 'left', p: 4 }}>
        {content}
      </Typography>
    </>
  );
}
