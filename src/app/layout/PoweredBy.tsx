/*
 * Copyright (c) 2024 FLECS Technologies GmbH
 *
 * Created on Tue Oct 08 2024
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
import FLECSLogo from './FLECSLogo';
import { useSearchParams } from 'react-router-dom';

const PoweredByFLECS: React.FC = () => {
  const [visible, setIsVisible] = React.useState(true);
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const hideAppBar = searchParams.get('hideappbar');
    if (hideAppBar?.toLowerCase() === 'true') {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [searchParams]);

  return (
    <div>
      {visible && (
        <a
          aria-label="powered-by-link"
          role="link"
          href="https://flecs.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center no-underline px-3 py-1.5 rounded-lg border border-brand bg-dark-end hover:bg-dark transition"
        >
          <FLECSLogo />
          <span className="ml-2 text-sm transition">
            powered by FLECS
          </span>
        </a>
      )}
    </div>
  );
};

export default PoweredByFLECS;
