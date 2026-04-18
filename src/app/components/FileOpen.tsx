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

import React, { useRef } from 'react';
import LoadButton from './LoadButton';

interface FileOpenProps extends Omit<React.ComponentProps<'button'>, 'onClick'> {
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  accept?: string;
  loading?: boolean;
  onConfirm: (data: string | File) => void;
  wholeFile?: boolean;
}

const FileOpen: React.FC<FileOpenProps> = (props) => {
  const {
    buttonText,
    buttonIcon,
    accept,
    loading,
    onConfirm,
    disabled,
    wholeFile,
    ...buttonProps
  } = props;
  const inputFile = useRef<HTMLInputElement>(null);

  const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length && !wholeFile) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === 'string') onConfirm(result);
      };
      reader.readAsText(files[0]);
    } else if (files && files.length) {
      onConfirm(files[0]);
    }
  };

  const onButtonClick = () => {
    inputFile.current?.click();
  };

  const onClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.value) target.value = '';
  };

  return (
    <div>
      <input
        data-testid="fileInput"
        style={{ display: 'none' }}
        accept={accept}
        ref={inputFile}
        onChange={(e) => handleFileOpen(e)}
        // the onClick event is necessary to null the current file. Otherwise there will be no onChange event if the user selects the same file again.
        onClick={(event) => {
          onClick(event);
        }}
        type="file"
      />
      <LoadButton
        {...buttonProps}
        startIcon={buttonIcon}
        text={buttonText}
        variant="outlined"
        onClick={onButtonClick}
        loading={loading || undefined}
        disabled={disabled}
      >
        {buttonText}
      </LoadButton>
    </div>
  );
};

export default FileOpen;
