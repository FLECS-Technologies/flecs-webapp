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
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import {
  QuestContext,
  QuestContextProvider,
  useQuestContext
} from '../QuestContext'
import { api } from '../../../api/flecs-core/api-client'
import { QuestState, Quest } from '@flecs/core-client-ts'
import { AxiosResponse } from 'axios'

// Consumer component to expose context values for testing
function TestConsumer() {
  const {
    quests,
    mainQuestIds,
    fetching,
    setFetching,
    fetchQuest,
    clearQuests
  } = useQuestContext(QuestContext)

  return (
    <div>
      <div data-testid='mainQuestIds'>{mainQuestIds.join(',')}</div>
      <div data-testid='questCount'>{quests.current.size}</div>
      <div data-testid='fetching'>{fetching ? 'true' : 'false'}</div>
      <button onClick={() => setFetching(true)}>Start Fetching</button>
      <button onClick={() => fetchQuest(5)}>Fetch Quest 5</button>
      <button onClick={() => clearQuests()}>Clear Quests</button>
    </div>
  )
}

describe('QuestContextProvider integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.resetAllMocks()
  })

  it('initial fetch populates mainQuestIds and questCount', async () => {
    const mockQuests: Quest[] = [
      { id: 1, state: QuestState.Pending } as Quest,
      { id: 2, state: QuestState.Ongoing } as Quest
    ]
    vi.spyOn(api.quests, 'questsGet').mockResolvedValue({
      data: mockQuests
    } as any as AxiosResponse<Quest[], any>)

    render(
      <QuestContextProvider>
        <TestConsumer />
      </QuestContextProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('mainQuestIds').textContent).toBe('1,2')
    )
    expect(screen.getByTestId('questCount').textContent).toBe('2')
  })

  it('polling triggers additional fetches when fetching is true', async () => {
    const mockQuests: Quest[] = []
    const spy = vi
      .spyOn(api.quests, 'questsGet')
      .mockResolvedValue({ data: mockQuests } as any as AxiosResponse<
        Quest[],
        any
      >)

    render(
      <QuestContextProvider>
        <TestConsumer />
      </QuestContextProvider>
    )

    // initial fetch
    expect(spy).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('Start Fetching'))

    act(() => {
      vi.advanceTimersByTime(1500) // 3 intervals of 500ms
    })

    expect(spy).toHaveBeenCalledTimes(1 + 3)
  })

  it('fetchQuest adds quest and subquests to map', async () => {
    const subQuest: Quest = { id: 3, state: QuestState.Pending } as Quest
    const mainQuest: Quest = {
      id: 5,
      state: QuestState.Ongoing,
      subquests: [subQuest]
    } as Quest
    // Prevent initial fetch from adding quests
    vi.spyOn(api.quests, 'questsGet').mockResolvedValue({
      data: []
    } as any as AxiosResponse<Quest[], any>)
    vi.spyOn(api.quests, 'questsIdGet').mockResolvedValue({
      data: mainQuest
    } as any as AxiosResponse<Quest, any>)

    render(
      <QuestContextProvider>
        <TestConsumer />
      </QuestContextProvider>
    )

    fireEvent.click(screen.getByText('Fetch Quest 5'))
    await waitFor(() =>
      expect(screen.getByTestId('questCount').textContent).toBe('2')
    )
  })

  it('clearQuests deletes only finished main quests', async () => {
    const finishedQuest = { id: 10, state: QuestState.Failed } as Quest
    const ongoingQuest = { id: 20, state: QuestState.Ongoing } as Quest
    vi.spyOn(api.quests, 'questsGet').mockResolvedValue({
      data: [finishedQuest, ongoingQuest]
    } as any as AxiosResponse<Quest[], any>)
    const deleteSpy = vi
      .spyOn(api.quests, 'questsIdDelete')
      .mockResolvedValue({} as any as AxiosResponse<void, any>)

    render(
      <QuestContextProvider>
        <TestConsumer />
      </QuestContextProvider>
    )

    // wait for initial fetch
    await waitFor(() =>
      expect(screen.getByTestId('questCount').textContent).toBe('2')
    )

    fireEvent.click(screen.getByText('Clear Quests'))
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledTimes(1))
    expect(deleteSpy).toHaveBeenCalledWith({ id: finishedQuest.id })
  })

  it('useQuestContext throws if no provider', () => {
    const consoleError = console.error
    console.error = () => {} // suppress React error boundary logs
    expect(() => render(<TestConsumer />)).toThrow(
      'useQuestContext must be used within a QuestProvider'
    )
    console.error = consoleError
  })
})
