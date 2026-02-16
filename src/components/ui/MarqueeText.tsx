/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Mon Jan 13 2026
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

import React, { useRef, useEffect, useState } from 'react';
import { Box, keyframes } from '@mui/material';

interface MarqueeTextProps {
  text: string;
  speed?: number; // Pixels per second
}

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

export default function MarqueeText({ text, speed = 50 }: MarqueeTextProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (containerRef.current && wrapperRef.current) {
      const overflow = wrapperRef.current.scrollWidth / 2 > containerRef.current.clientWidth;
      if (overflow) {
        const width = wrapperRef.current.scrollWidth / 2;
        setDuration(width / speed);
      } else {
        setDuration(0);
      }
    }
  }, [text, speed]);

  return (
    <Box ref={containerRef} sx={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
      <Box
        ref={wrapperRef}
        sx={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          animation: duration ? `${scroll} ${duration}s linear infinite` : 'none',
        }}
      >
        <Box component="span" sx={{ pr: 4 }}>
          {text}
        </Box>
        <Box component="span" sx={{ pr: 4 }}>
          {text}
        </Box>
      </Box>
    </Box>
  );
}
