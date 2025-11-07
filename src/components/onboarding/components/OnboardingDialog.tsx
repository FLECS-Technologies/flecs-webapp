/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 03 2025
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  DialogActions,
  Button,
} from '@mui/material';
import { MultiStepWizard } from '../../steppers';
import { OnboardingProvider } from '../providers/OnboardingProvider';
import { useWizard } from '../../steppers/providers';

interface OnboardingDialogProps {
  open: boolean;
  onClose?: () => void;
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ open, onClose }) => {
  return (
    <OnboardingProvider>
      <Dialog
        open={open}
        onClose={undefined} // Prevent closing by clicking outside or pressing Escape
        maxWidth="lg"
        fullScreen
        disableEscapeKeyDown // Disable Escape key
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Welcome
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ minWidth: 800, minHeight: 600 }}>
            <MultiStepWizard title="Device Onboarding" />
          </Box>
        </DialogContent>
        <DialogActions>
          <CloseButtonWrapper onClose={onClose} />
        </DialogActions>
      </Dialog>
    </OnboardingProvider>
  );
};

const CloseButtonWrapper: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { isCompleted } = useWizard();

  return (
    <Button variant="contained" onClick={onClose} sx={{ m: 1 }} disabled={!isCompleted}>
      Close
    </Button>
  );
};
