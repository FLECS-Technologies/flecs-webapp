/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Mon Tue 24 2025
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
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QuestIcon } from '../QuestIcon'
import { QuestState } from '@flecs/core-client-ts'

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
  __esModule: true,
  ErrorOutline: () => <div data-testid='error-icon' />,
  CheckCircle: () => <div data-testid='success-icon' />,
  HourglassEmpty: () => <div data-testid='pending-icon' />,
  Block: () => <div data-testid='skipped-icon' />
}))

// Mock CircularProgress from MUI
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material')
  return {
    ...actual,
    CircularProgress: () => <div data-testid='default-spinner' />
  }
})

describe('QuestIcon Component', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders ErrorOutline for Failed and Failing states', () => {
    render(<QuestIcon state={QuestState.Failed} />)
    expect(screen.getByTestId('error-icon')).toBeInTheDocument()
    cleanup()
    render(<QuestIcon state={QuestState.Failing} />)
    expect(screen.getByTestId('error-icon')).toBeInTheDocument()
  })

  it('renders CheckCircle for Success state', () => {
    render(<QuestIcon state={QuestState.Success} />)
    expect(screen.getByTestId('success-icon')).toBeInTheDocument()
  })

  it('renders HourglassEmpty for Pending state', () => {
    render(<QuestIcon state={QuestState.Pending} />)
    expect(screen.getByTestId('pending-icon')).toBeInTheDocument()
  })

  it('renders BlockIcon for Skipped state', () => {
    render(<QuestIcon state={QuestState.Skipped} />)
    expect(screen.getByTestId('skipped-icon')).toBeInTheDocument()
  })

  it('renders CircularProgress for unknown/default state', () => {
    // cast an invalid state
    render(<QuestIcon state={QuestState.Ongoing} />)
    expect(screen.getByTestId('default-spinner')).toBeInTheDocument()
  })
})
