/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MultiStepWizard } from '@shared/components/steppers';
import { OnboardingProvider } from '@features/onboarding/providers/OnboardingProvider';
import { useWizard } from '@shared/components/steppers/providers';
import { brand } from '@app/theme/tokens';
import { ArrowRight } from 'lucide-react';

function OnboardingContent() {
  const navigate = useNavigate();
  const { isCompleted } = useWizard();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome to FLECS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's get your device ready in under 30 seconds.
        </Typography>
      </Box>

      <MultiStepWizard title="Device Onboarding" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="text"
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ color: brand.muted }}
        >
          Skip for now
        </Button>
        {isCompleted && (
          <Button
            variant="contained"
            endIcon={<ArrowRight size={18} />}
            onClick={() => navigate('/device-login')}
          >
            Get started
          </Button>
        )}
      </Box>
    </Container>
  );
}

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}
