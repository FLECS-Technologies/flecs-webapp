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
      <div className="flex justify-center py-2 opacity-40">
        <FLECSLogo />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 opacity-40">
      <FLECSLogo />
      <span className="text-[10px] text-muted tracking-wide">powered by FLECS</span>
    </div>
  );
}
