/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
// This component is a workaround for React 18 where the "normal" useEffect is called twice for useEffects with zero dependencies see more details here: https://dev.to/ag-grid/react-18-avoiding-use-effect-getting-called-twice-4i9e
export const useEffectOnce = (effect) => {
  const destroyFunc = React.useRef()
  const effectCalled = React.useRef(false)
  const renderAfterCalled = React.useRef(false)
  const [val, setVal] = React.useState(0)

  if (effectCalled.current) {
    renderAfterCalled.current = true
  }

  React.useEffect(() => {
    // only execute the effect first time around
    if (!effectCalled.current) {
      destroyFunc.current = effect()
      effectCalled.current = true
    }

    // this forces one render after the effect is run
    setVal(val => val + 1)
    console.log(val)

    return () => {
      // if the comp didn't render since the useEffect was called,
      // we know it's the dummy React cycle
      if (!renderAfterCalled.current) { return }
      if (destroyFunc.current) { destroyFunc.current() }
    }
  }, [])
}
