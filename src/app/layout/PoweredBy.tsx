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

import FLECSLogo from './FLECSLogo';
import { useTenant } from '@app/theme/TenantContext';

export default function PoweredByFLECS({ collapsed }: { collapsed?: boolean }) {
  const { features } = useTenant();
  if (!features.powered_by_flecs) return null;

  if (collapsed) {
    return (
      <div className="flex justify-center py-2 border-t border-border">
        <a
          href="https://flecs.tech"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Powered by FLECS"
        >
          <FLECSLogo />
        </a>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t border-border">
      <a
        href="https://flecs.tech"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover transition text-muted hover:text-text-primary"
      >
        <FLECSLogo />
        <span className="text-xs">powered by FLECS</span>
      </a>
    </div>
  );
}
