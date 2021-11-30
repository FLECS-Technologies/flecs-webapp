import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'

const FileOpen = (props) => {
  const { buttonText, buttonIcon, accept, setFile, onConfirm } = props
  const inputFile = useRef(null)

  const handleFileOpen = e => {
    const { files } = e.target
    if (files && files.length) {
      const filename = files[0].name

      const parts = filename.split('.')
      const fileType = parts[parts.length - 1]
      console.log('fileType', fileType) // ex: zip, rar, jpg, svg etc.

      setFile(files[0])
      onConfirm()
    }
  }

  const onButtonClick = () => {
    inputFile.current.click()
  }

  return (
    <div>
      <input
        style={{ display: 'none' }}
        accept={accept}
        ref={inputFile}
        onChange={handleFileOpen}
        type="file"
      />
      <Button
        startIcon={buttonIcon}
        variant='outlined'
        onClick={onButtonClick}
        >
        {buttonText}
      </Button>
    </div>
  )
}

FileOpen.propTypes = {
  buttonText: PropTypes.string,
  buttonIcon: PropTypes.any,
  accept: PropTypes.string,
  setFile: PropTypes.any,
  onConfirm: PropTypes.func
}

export default FileOpen
