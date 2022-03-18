/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Mar 18 2022
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

import ReactDOM from 'react-dom'

jest.mock('react-dom', () => ({ render: jest.fn() }))

describe('Application root', () => {
  it('should render without crashing', () => {
    const div = document.createElement('div')
    div.id = 'root'
    document.body.appendChild(div)
    require('../index.js')
    expect(ReactDOM.render).toHaveBeenCalled()
  })
})
