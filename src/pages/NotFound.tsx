/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 04 2022
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
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[95vh] gap-2">
      <h1 aria-label="404" className="text-6xl font-bold text-brand">
        404
      </h1>
      <p aria-label="sorry" className="text-base">
        Sorry we couldn&apos;t find that page...
      </p>
      <p aria-label="take-me-back" className="text-base">
        Take me back to&nbsp;
        <Link to="/" className="text-brand hover:underline">
          my apps
        </Link>
        .
      </p>
    </div>
  );
}
