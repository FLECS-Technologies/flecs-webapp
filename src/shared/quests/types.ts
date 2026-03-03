/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Aug 02 2024
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
export interface Job {
  id: number;
  status: 'running' | 'queued' | 'successful' | 'failed' | 'pending' | 'cancelled';
  description: string;
  numSteps: number;
  currentStep: {
    description: string;
    num: number;
    unit: string;
    unitsTotal: number;
    unitsDone: number;
    rate: number;
  };
  result: {
    code: number;
    message: string;
  };
}

export interface job_meta {
  jobId: number;
}
