/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import LoadButton from './LoadButton'

const FileOpen = (props) => {
  const { buttonText, buttonIcon, accept, loading, /* setFile , */ onConfirm, disabled } = props
  const inputFile = useRef(null)

  const handleFileOpen = e => {
    const { files } = e.target
    if (files && files.length) {
      e.preventDefault()
      const reader = new FileReader()
      reader.onload = async (e) => {
        onConfirm(e.target.result)
      }
      reader.readAsText(files[0])
    }
  }

  const onButtonClick = () => {
    inputFile.current.click()
  }

  return (
    <div>
      <input
        data-testid="fileInput"
        style={{ display: 'none' }}
        accept={accept}
        ref={inputFile}
        onChange={(e) => handleFileOpen(e)}
        // the onClick event is necessary to null the current file. Otherwise there will be no onChange event if the user selects the same file again.
        onClick={(event) => { event.target.value = null }}
        type="file"
      />
      <LoadButton
        startIcon={buttonIcon}
        text={buttonText}
        variant='outlined'
        onClick={onButtonClick}
        loading={loading || undefined}
        disabled={disabled}
        >
        {buttonText}
      </LoadButton>
    </div>
  )
}

FileOpen.propTypes = {
  buttonText: PropTypes.string,
  buttonIcon: PropTypes.any,
  accept: PropTypes.string,
  setFile: PropTypes.any,
  loading: PropTypes.bool,
  onConfirm: PropTypes.func,
  disabled: PropTypes.bool
}

export default FileOpen
