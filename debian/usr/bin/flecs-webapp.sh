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

CHANNEL=latest

if [ -f /etc/flecs.d/channel ]; then
    CHANNEL=$(cat /etc/flecs.d/channel);
fi

/usr/bin/docker stop flecs-webapp 2>/dev/null;
/usr/bin/docker rm flecs-webapp 2>/dev/null;
/usr/bin/docker pull flecs/webapp:${CHANNEL}
/usr/bin/docker run -d -p 80:80 --add-host=host.docker.internal:host-gateway --name flecs-webapp flecs/webapp:${CHANNEL}
