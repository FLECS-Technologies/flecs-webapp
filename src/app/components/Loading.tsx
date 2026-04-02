/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jun 03 2025
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
import React from 'react';

interface LoadingProps {
  loading: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ loading, children, className }) => {
  return (
    <div className={`relative ${className ?? ''}`}>
      {children}
      {loading && (
        <div
          data-testid="circularprogress"
          className="absolute top-1/2 left-1/2 -mt-2 -ml-2 w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"
        />
      )}
    </div>
  );
};
