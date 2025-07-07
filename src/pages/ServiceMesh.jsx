/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Feb 18 2022
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
import { Alert, AlertTitle, Grid, Paper, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import React from 'react';
import HelpButton from '../components/buttons/help/HelpButton';
import { servicemesh } from '../components/help/helplinks';
import { ReferenceDataContext } from '../data/ReferenceDataContext';
import { EditorButton } from '../components/buttons/editors/EditorButton';

export default function ServiceMesh() {
  const { appList } = React.useContext(ReferenceDataContext);
  const [serviceMeshInstalled, setServiceMeshInstalled] = React.useState(false);
  const [serviceMeshInstance, setServiceMeshInstance] = React.useState();

  // check if service mesh is installed
  React.useEffect(() => {
    if (appList) {
      const serviceMeshApp = appList.find((app) => app.appKey.name === 'tech.flecs.flunder');
      if (
        serviceMeshApp &&
        serviceMeshApp.instances.length > 0 &&
        serviceMeshApp.instances[0].editors.length > 0
      ) {
        setServiceMeshInstalled(true);
        setServiceMeshInstance(serviceMeshApp.instances[0]);
      } else {
        setServiceMeshInstalled(false);
        setServiceMeshInstance(null);
      }
    }
  }, [appList]);

  return (
    <>
      <Paper data-testid="service-mesh" sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Typography
            data-testid="service-mesh-title"
            sx={{ flex: '0.1 0.1 10%' }}
            variant="h6"
            id="service-mesh-title"
            component="div"
          >
            Service Mesh
            <HelpButton url={servicemesh}></HelpButton>
          </Typography>
          {serviceMeshInstalled &&
            serviceMeshInstance &&
            serviceMeshInstance.editors &&
            serviceMeshInstance.editors.length > 0 && (
              <EditorButton key={0} editor={serviceMeshInstance.editors[0]} index={0} />
            )}
        </Toolbar>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ pb: { sm: 2 } }}
        >
          <Grid>
            {serviceMeshInstalled && (
              <React.Fragment>
                <Alert severity="info">
                  <AlertTitle>Info</AlertTitle>
                  <Typography>
                    The service mesh is a separate app that has its own ui now. Click on &quot;
                    {`Open ${serviceMeshInstance?.editors?.[0]?.name || 'editor'}`}&quot; to access
                    the service mesh.
                  </Typography>
                </Alert>
              </React.Fragment>
            )}
            {!serviceMeshInstalled && (
              <Alert severity="info">
                <AlertTitle>Info</AlertTitle>
                <Typography>The service mesh is a separate app that has its own ui now.</Typography>
                <Typography>
                  Please visit our <Link to="/Marketplace">marketplace</Link> to install the latest
                  version of the service mesh app.
                </Typography>
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
