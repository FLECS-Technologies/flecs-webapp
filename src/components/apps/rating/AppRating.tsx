/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Aug 12 2022
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
import { Rating, Typography } from '@mui/material';

interface AppRatingProps {
  app?: {
    average_rating?: number | string;
    rating_count?: number | string;
    [key: string]: any;
  };
}

const AppRating: React.FC<AppRatingProps> = ({ app }) => {
  const [value, setValue] = React.useState<number>(Number(app?.average_rating));

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Rating size="small" value={value} readOnly />
      <Typography variant="subtitle1" sx={{ marginLeft: 1 }}>
        ({app?.rating_count})
      </Typography>
    </div>
  );
};

export default AppRating;
