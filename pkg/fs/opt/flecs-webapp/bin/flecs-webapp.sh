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

SCRIPTNAME=$(basename $(readlink -f ${0}))

DOCKER_IMAGE=flecspublic.azurecr.io/webapp
DOCKER_TAG=
CONTAINER=flecs-webapp

print_usage() {
  echo "Usage: ${SCRIPTNAME} <action>"
  echo
  echo "Manage FLECS Webapp Docker container"
  echo
  echo "Actions:"
  echo "      pull      Pull FLECS Webapp Docker image"
  echo "      create    Create FLECS Webapp Docker container"
  echo "      delete    Delete FLECS Webapp Docker container"
  echo "      stop      Cleanly shutdown FLECS Webapp Docker container"
  echo "      kill      Kill FLECS Webapp Docker container"
  echo
}

create_network() {
  # check if we have created network 'flecs' before
  GATEWAY=`docker network inspect --format "{{range .IPAM.Config}}{{.Gateway}}{{end}}" flecs 2>/dev/null`

  # if network 'flecs' does not exist, create it
  if [ -z "${GATEWAY}" ]; then
    # list all in-use IP addresses
    if ifconfig -a >/dev/null 2>&1; then
      IPS=`ifconfig -a | sed -n -E 's/^[[:space:]]+inet ([0-9\.]+).+$/\1/p'`
    elif ip addr >/dev/null 2>&1; then
      IPS=`ip addr -a | sed -n -E 's/^[[:space:]]+inet ([0-9\.]+).+$/\1/p'`
    else
      echo "Warning: Cannot determine in-use IP addresses" 1>&2
    fi
    # try subnets 172.21.0.0/16 --> 172.31.0.0/16
    SUBNETS=(21 22 23 24 25 26 27 28 29 30 31)
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
      # try to create flecs network as Docker bridge network
      if docker network create --driver bridge --subnet 172.${SUBNET}.0.0/16 --gateway 172.${SUBNET}.0.1 flecs >/dev/null 2>&1; then
        GATEWAY="172.${SUBNET}.0.1"
        break;
      fi
    done
  fi

  if [ -z "${GATEWAY}" ]; then
    echo "Network 'flecs' does not exist and could not create it" 2>&1
    exit 1
  fi

  IP=`echo ${GATEWAY} | sed -E 's/[0-9]+\.[0-9]+$/255.254/g'`
  echo "Assigning IP ${IP} to ${CONTAINER}"
}

case ${1} in
  pull)
    # If pulling fails but an image is already present locally,
    # consider pulling successful so the service startup does not fail
    IMAGE_ID=$(docker image ls --quiet ${DOCKER_IMAGE}:${DOCKER_TAG})
    docker pull --quiet ${DOCKER_IMAGE}:${DOCKER_TAG}
    EXIT_CODE=$?
    if [ ${EXIT_CODE} -ne 0 ]; then
      if [ ! -z "${IMAGE_ID}" ]; then
        echo "Using local image ${IMAGE_ID}"
        exit 0
      fi
      exit ${EXIT_CODE}
    fi
    ;;
  create)
    create_network
    if [ -z "${IP}" ]; then
      echo "Could not calculate IP address to assign to ${CONTAINER}"
      exit 1
    fi

    PORTS=(80 8080 8000 none)
    PORTS_HEX=(0050 1F90 1F40 none)
    for i in ${!PORTS_HEX[*]}; do
      if ! cat /proc/net/tcp /proc/net/tcp6 | grep -E ":${PORTS_HEX[$i]} [0-9A-F]{8}:[0-9A-F]{4} 0A"; then
        break
      fi
    done

    if [ "${PORTS[$i]}" == "none" ]; then
      echo "No free port found - exiting"
      exit 1
    fi
    echo "Binding flecs-webapp to port ${PORTS[$i]}"

    docker create \
      --name ${CONTAINER} \
      --network flecs \
      --ip ${IP} \
      --add-host flecs-floxy:${GATEWAY} \
      --publish ${PORTS[$i]}:80 \
      --rm ${DOCKER_IMAGE}:${DOCKER_TAG}
    exit $?
    ;;
  remove)
    docker rm -f ${CONTAINER} >/dev/null 2>&1
    exit $?
    ;;
  stop)
    docker stop --time 10 ${CONTAINER}
    exit $?
    ;;
  kill)
    docker kill --signal KILL ${CONTAINER}
    exit $?
    ;;
  *)
    print_usage
    exit 1
  ;;
esac
