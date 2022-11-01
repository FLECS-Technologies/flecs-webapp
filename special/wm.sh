#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

sed -i 's#^\(.*\)"homepage":.*$#\1"homepage": "http://localhost/uc-addon-flecs/ui/",#g' package.json
sed -i 's#^\(.*\)<Router basename=.*$#\1<Router basename=\x27/uc-addon-flecs/ui\x27>#g' src/index.js
