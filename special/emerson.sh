#!/bin/bash

sed -i 's#^\(.*\)"homepage":.*$#\1"homepage": "http://localhost/flecs/ui/",#g' package.json
sed -i 's#^\(.*\)base: .*\x27\(.*\)$#\1base: \x27/flecs/ui/\x27\2#g' vite.config.ts
sed -i 's#^\(.*\)<Router basename=.*$#\1<Router basename=\x27/flecs/ui\x27>#g' src/main.tsx

sed -i 's#$scheme://$http_host#$scheme://localhost:40000#g' docker/conf.d/default.conf
