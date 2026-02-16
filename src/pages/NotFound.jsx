/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 04 2022
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
import { Link } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '95vh' }}
    >
      <Grid size={{ xs: 3 }}>
        <Typography aria-label="404" variant="h1" color="primary.main">
          404
        </Typography>
      </Grid>
      <Grid size={{ xs: 3 }}>
        <Typography aria-label="sorry" variant="body">
          Sorry we couldn&apos;t find that page...
        </Typography>
      </Grid>
      <Grid size={{ xs: 3 }}>
        <Typography aria-label="take-me-back" variant="body">
          Take me back to&nbsp;
          <Link to="/">my apps</Link>.
        </Typography>
      </Grid>
    </Grid>
  );
}
