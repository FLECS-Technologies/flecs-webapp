import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock MUI theme utilities
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<any>('@mui/material');
  return {
    ...actual,
    alpha: vi.fn((color: string, opacity: number) => `alpha(${color},${opacity})`),
    useTheme: () => ({
      palette: {
        error: { main: 'errorMain' },
        success: { main: 'successMain' },
      },
    }),
  };
});

import {
  questStateFinished,
  questStateFinishedOk,
  getQuestStateColor,
  getQuestStateProgressColor,
  questStateRunning,
} from '../QuestState';
import { QuestState } from '@flecs/core-client-ts';

describe('QuestState utility functions', () => {
  describe('questStateFinished', () => {
    it('returns false for Failing, Ongoing, and Pending', () => {
      expect(questStateFinished(QuestState.Failing)).toBe(false);
      expect(questStateFinished(QuestState.Ongoing)).toBe(false);
      expect(questStateFinished(QuestState.Pending)).toBe(false);
    });

    it('returns true for Success, Failed, Skipped', () => {
      expect(questStateFinished(QuestState.Success)).toBe(true);
      expect(questStateFinished(QuestState.Failed)).toBe(true);
      expect(questStateFinished(QuestState.Skipped)).toBe(true);
    });
  });

  describe('questStateFinishedOk', () => {
    it('returns true for Success and Skipped', () => {
      expect(questStateFinishedOk(QuestState.Success)).toBe(true);
      expect(questStateFinishedOk(QuestState.Skipped)).toBe(true);
    });

    it('returns false for Failing, Ongoing, Pending, Failed', () => {
      expect(questStateFinishedOk(QuestState.Failing)).toBe(false);
      expect(questStateFinishedOk(QuestState.Ongoing)).toBe(false);
      expect(questStateFinishedOk(QuestState.Pending)).toBe(false);
      expect(questStateFinishedOk(QuestState.Failed)).toBe(false);
    });
  });

  describe('getQuestStateColor', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns semi-transparent error color for Failed and Failing', () => {
      expect(getQuestStateColor(QuestState.Failed)).toBe('alpha(errorMain,0.75)');
      expect(getQuestStateColor(QuestState.Failing)).toBe('alpha(errorMain,0.75)');
    });

    it('returns semi-transparent success color for Success', () => {
      expect(getQuestStateColor(QuestState.Success)).toBe('alpha(successMain,0.75)');
    });

    it('returns transparent for other states', () => {
      expect(getQuestStateColor(QuestState.Ongoing)).toBe('transparent');
      expect(getQuestStateColor(QuestState.Pending)).toBe('transparent');
      expect(getQuestStateColor(QuestState.Skipped)).toBe('transparent');
    });
  });

  describe('getQuestStateProgressColor', () => {
    it('maps Failed and Failing to "error"', () => {
      expect(getQuestStateProgressColor(QuestState.Failed)).toBe('error');
      expect(getQuestStateProgressColor(QuestState.Failing)).toBe('error');
    });

    it('maps Success to "success"', () => {
      expect(getQuestStateProgressColor(QuestState.Success)).toBe('success');
    });

    it('maps Ongoing to "secondary" and Pending to "info"', () => {
      expect(getQuestStateProgressColor(QuestState.Ongoing)).toBe('secondary');
      expect(getQuestStateProgressColor(QuestState.Pending)).toBe('info');
    });

    it('maps unknown/default to "inherit"', () => {
      expect(getQuestStateProgressColor(QuestState.Skipped)).toBe('inherit');
    });
  });

  describe('questStateRunning', () => {
    it('returns true for Failing and Ongoing', () => {
      expect(questStateRunning(QuestState.Failing)).toBe(true);
      expect(questStateRunning(QuestState.Ongoing)).toBe(true);
    });

    it('returns false for other states', () => {
      expect(questStateRunning(QuestState.Pending)).toBe(false);
      expect(questStateRunning(QuestState.Success)).toBe(false);
      expect(questStateRunning(QuestState.Skipped)).toBe(false);
      expect(questStateRunning(QuestState.Failed)).toBe(false);
    });
  });
});
