#!/bin/bash

# Copyright 2021-2022 FLECS Technologies GmbH
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

DOCKER_TAG=

/usr/bin/docker stop flecs-webapp 2>/dev/null;
/usr/bin/docker rm -f flecs-webapp 2>/dev/null;
PORTS=(80 8080 8008 none)
for PORT in ${PORTS[*]}; do
    if ! netstat -tulpn | grep ":${PORT} " >/dev/null 2>&1; then
        break
    fi
done

if [ "${PORT}" == "none" ]; then
    echo "No free port found - exiting"
    exit 1
fi

echo "Binding flecs-webapp to port ${PORT}"
/usr/bin/docker run -d -p ${PORT}:80 --add-host=host.docker.internal:172.17.0.1 --name flecs-webapp flecs/webapp:${DOCKER_TAG}
