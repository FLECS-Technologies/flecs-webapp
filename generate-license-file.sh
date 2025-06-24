#!/bin/bash

DIRNAME=$(dirname $(readlink -f ${0}))

echo ${DIRNAME}

npx generate-license-file --input ${DIRNAME}/package.json --output ${DIRNAME}/src/assets/third-party-licenses.txt --overwrite