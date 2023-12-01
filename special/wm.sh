#!/bin/bash

sed -i 's#^\(.*\)"homepage":.*$#\1"homepage": "http://localhost/u-os-app-flecs/ui/",#g' package.json
sed -i 's#^\(.*\)<Router basename=.*$#\1<Router basename=\x27/u-os-app-flecs/ui\x27>#g' src/index.js

sed -i 's#$scheme://$http_host#$scheme://localhost:65350#g' docker/conf.d/default.conf
