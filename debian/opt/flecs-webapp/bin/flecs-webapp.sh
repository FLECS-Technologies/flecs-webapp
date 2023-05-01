#!/bin/bash
# Copyright 2021-2023 FLECS Technologies GmbH
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

# try to determine host IP address on default 'docker0' network
GATEWAY=`ifconfig docker0 2>/dev/null | sed -n -E 's/^[[:space:]]+inet ([0-9\.]+).+$/\1/p'`

# if default bridge does not exist, check if we have created network flecs-webapp before
if [ -z "${GATEWAY}" ]; then
  GATEWAY=`docker network inspect --format "{{range .IPAM.Config}}{{.Gateway}}{{end}}" flecs-webapp 2>/dev/null`
  NETWORK="--network flecs-webapp"
fi

# if flecs-webapp network does not exist, create it
if [ -z "${GATEWAY}" ]; then
  # list all in-use IP addresses
  IPS=`ifconfig -a | sed -n -E 's/^[[:space:]]+inet ([0-9\.]+).+$/\1/p'`
  # try subnets 172.31.0.0/16 --> 172.22.0.0/16 (everything above "flecs" network)
  SUBNETS=(31 30 29 28 27 26 25 24 23 22)
  for SUBNET in ${SUBNETS[*]}; do
    # skip subnets that overlap with in-use IP addresses
    SKIP_SUBNET=
    for IP in ${IPS}; do
      if [[ ${IP} == 172.${SUBNET}.* ]]; then
        echo "${IP} collides with subnet 172.${SUBNET}.0.0/16 -- skipping"
        SKIP_SUBNET="true"
      fi
    done
    if [ ! -z "${SKIP_SUBNET}" ]; then
      continue
    fi
    # try to create flecs-webapp network as Docker bridge network
    if docker network create --driver bridge --subnet 172.${SUBNET}.0.0/16 --gateway 172.${SUBNET}.0.1 flecs-webapp >/dev/null 2>&1; then
      GATEWAY="172.${SUBNET}.0.1"
      NETWORK="--network flecs-webapp"
      break;
    fi
  done
fi

if [ -z "${GATEWAY}" ]; then
  echo "No valid gateway address found - exiting"
  exit 1
fi

docker stop flecs-webapp 2>/dev/null;
docker rm -f flecs-webapp 2>/dev/null;
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
docker run -d -p ${PORT}:80 --add-host=host.docker.internal:${GATEWAY} ${NETWORK} --name flecs-webapp flecs/webapp:${DOCKER_TAG}
