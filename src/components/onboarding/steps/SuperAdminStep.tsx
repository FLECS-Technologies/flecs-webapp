/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Oct 31 2025
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
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, LinearProgress, Stack } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import { WizardStep, WizardStepProps } from '../../steppers';
import { usePublicAuthProviderApi } from '../../../components/providers/AuthProviderApiProvider';
import { checkSuperAdminExists } from '../utils/onboardingHelpers';

const SuperAdminStepComponent: React.FC<WizardStepProps> = ({
  onNext,
  onPrevious,
  onComplete,
  isLoading,
  error,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const api = usePublicAuthProviderApi();

  const getPasswordStrength = (
    password: string,
  ): { score: number; label: string; color: string } => {
    let score = 0;

    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'error.main' };
    if (score <= 50) return { score, label: 'Fair', color: 'warning.main' };
    if (score <= 75) return { score, label: 'Good', color: 'info.main' };
    return { score, label: 'Strong', color: 'success.main' };
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setValidationErrors({});
    try {
      if (!api || !api.AuthApi || !api.AuthApi.postSuperAdmin) throw new Error('API unavailable');
      await api.AuthApi.postSuperAdmin({
        full_name: username,
        name: username,
        password,
      });
      if (onComplete) onComplete();
      if (onNext) onNext();
    } catch (err: any) {
      let msg = err?.message || 'Failed to create super admin. Please try again.';
      setValidationErrors((prev) => ({ ...prev, general: msg }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <form onSubmit={handleFormSubmit}>
        <Typography variant="h5" gutterBottom>
          Create Super Administrator
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create the initial administrator account for your device. This account will have full
          access to manage the system.
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!validationErrors.username}
            helperText={validationErrors.username}
            disabled={isLoading}
            autoFocus
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            disabled={isLoading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {password && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Password Strength: {passwordStrength.label}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.score}
                sx={{
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: passwordStrength.color,
                  },
                }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
            disabled={isLoading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            tabIndex={3}
            type="submit"
          >
            {isLoading ? 'Creating Admin...' : 'Create Administrator'}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {validationErrors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {validationErrors.general}
          </Alert>
        )}
      </form>
    </Box>
  );
};

export class SuperAdminStep extends WizardStep {
  readonly id = 'super-admin';
  readonly title = 'Create Super Admin';
  readonly description = 'Create the initial administrator account';
  readonly component = SuperAdminStepComponent;

  async isCompleted(apiContext?: any): Promise<boolean> {
    if (!apiContext?.auth) return false;

    return await checkSuperAdminExists(apiContext.auth);
  }

  canSkip(): boolean {
    return false;
  }

  getDependencies(): string[] {
    return ['auth-provider'];
  }
}
