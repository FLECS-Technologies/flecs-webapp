import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasQuestFailedSubquest, questFinished } from '../Quest';
import { QuestState, Quest } from '@flecs/core-client-ts';
import * as StateUtils from '../QuestState';

describe('Quest utility functions', () => {
  describe('hasQuestFailedSubquest', () => {
    it('returns false if there are no subquests', () => {
      const quest: Quest = { id: 1, state: QuestState.Pending } as Quest;
      expect(hasQuestFailedSubquest(quest)).toBe(false);
    });

    it('returns false if no subquests have failed or failing', () => {
      const sub1: Quest = { id: 2, state: QuestState.Pending } as Quest;
      const sub2: Quest = { id: 3, state: QuestState.Success } as Quest;
      const quest: Quest = {
        id: 1,
        state: QuestState.Pending,
        subquests: [sub1, sub2],
      } as Quest;
      expect(hasQuestFailedSubquest(quest)).toBe(false);
    });

    it('returns true if an immediate subquest is Failed or Failing', () => {
      const failed: Quest = { id: 2, state: QuestState.Failed } as Quest;
      const quest1: Quest = {
        id: 1,
        state: QuestState.Pending,
        subquests: [failed],
      } as Quest;
      expect(hasQuestFailedSubquest(quest1)).toBe(true);

      const failing: Quest = { id: 3, state: QuestState.Failing } as Quest;
      const quest2: Quest = {
        id: 1,
        state: QuestState.Pending,
        subquests: [failing],
      } as Quest;
      expect(hasQuestFailedSubquest(quest2)).toBe(true);
    });

    it('returns true if a nested subquest has failed', () => {
      const deepFail: Quest = { id: 4, state: QuestState.Failed } as Quest;
      const child: Quest = {
        id: 3,
        state: QuestState.Pending,
        subquests: [deepFail],
      } as Quest;
      const parent: Quest = {
        id: 1,
        state: QuestState.Pending,
        subquests: [child],
      } as Quest;
      expect(hasQuestFailedSubquest(parent)).toBe(true);
    });

    it('handles mixed nested structures correctly', () => {
      const deepPending: Quest = { id: 5, state: QuestState.Pending } as Quest;
      const deepFailing: Quest = { id: 6, state: QuestState.Failing } as Quest;
      const child1: Quest = {
        id: 3,
        state: QuestState.Pending,
        subquests: [deepPending],
      } as Quest;
      const child2: Quest = {
        id: 4,
        state: QuestState.Pending,
        subquests: [deepFailing],
      } as Quest;
      const quest: Quest = {
        id: 1,
        state: QuestState.Pending,
        subquests: [child1, child2],
      } as Quest;
      expect(hasQuestFailedSubquest(quest)).toBe(true);
    });
  });

  describe('questFinished', () => {
    let finishSpy: any;

    beforeEach(() => {
      finishSpy = vi.spyOn(StateUtils, 'questStateFinished');
    });

    afterEach(() => {
      finishSpy.mockRestore();
    });

    it('returns whatever questStateFinished returns', () => {
      const quest: Quest = { id: 7, state: QuestState.Success } as Quest;
      finishSpy.mockReturnValue(true);
      expect(questFinished(quest)).toBe(true);

      finishSpy.mockReturnValue(false);
      expect(questFinished(quest)).toBe(false);
    });

    it('calls questStateFinished with the quest state', () => {
      const quest: Quest = { id: 8, state: QuestState.Failing } as Quest;
      questFinished(quest);
      expect(finishSpy).toHaveBeenCalledWith(QuestState.Failing);
    });
  });
});
