/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Mar 14 2022
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
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import DataTable from '../DataTable'

const testData = [
  {
    key: 'root/app/1',
    value: 'xyz',
    encoding: 'plain/text',
    timestamp: '1666011327519825920'
  },
  {
    key: 'root/app/2',
    value: 'abc',
    encoding: 'plain/json',
    timestamp: '1666011337519825920'
  },
  {
    key: 'root/app/3',
    value: 'Hello World!',
    encoding: 'application/octet-stream',
    timestamp: '1666011347519825920'
  }
]
describe('DataTable', () => {
  test('renders DataTable component', () => {
    render(<DataTable data={testData}></DataTable>)

    expect(screen.getByText('root/app/1')).toBeVisible()
    expect(screen.getByText('xyz')).toBeVisible()
    expect(screen.getByText('plain/text')).toBeVisible()
    expect(screen.getByText('17.10.2022, 14:55:27')).toBeVisible()
    expect(screen.getByText('root/app/2')).toBeVisible()
    expect(screen.getByText('Hello World!')).toBeVisible()
  })
})
