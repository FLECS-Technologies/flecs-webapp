/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 29 2025
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
import { Version } from '../models/version';

function createVersion(
  version: string,
  release_notes?: string | null,
  breaking_changes?: string | null,
  installed?: boolean,
): Version {
  return { version, release_notes, breaking_changes, installed };
}

function createVersions(versions: string[], installedVersions: string[]): Version[] {
  const versionsArray: Version[] = [];

  if (versions) {
    versions.forEach((version) => {
      versionsArray.push(
        createVersion(version, undefined, undefined, installedVersions?.includes(version)),
      );
    });
  } else if (installedVersions) {
    installedVersions.forEach((version) => {
      versionsArray.push(createVersion(version, null, null, true));
    });
  }
  return versionsArray;
}

function getLatestVersion(versions: Version[]): Version | undefined {
  if (versions) {
    return versions[0];
  }
}

function findVersionByProperty(versions: Version[], versionProperty: string): Version {
  return versions.find((version) => version.version === versionProperty) || createVersion('');
}

export { createVersion, createVersions, findVersionByProperty, getLatestVersion };
