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
    GATEWAY=`docker network inspect --format "{{range .IPAM.Config}}{{.Gateway}}{{end}}" flecs 2>/dev/null`
    IP=`echo ${GATEWAY} | sed -E 's/[0-9]+\.[0-9]+$/255.254/g'`
    echo "Assigning IP ${IP} to ${CONTAINER}"
    if [ -z "${IP}" ]; then
      echo "Could not calculate IP address to assign to ${CONTAINER}"
      exit 1
    fi

    docker create \
      --name ${CONTAINER} \
      --network flecs \
      --ip ${IP} \
      --add-host flecs-floxy:${GATEWAY} \
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
