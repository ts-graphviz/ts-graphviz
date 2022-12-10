#/bin/bash

VERSION=$(jq -r .version < ../../../package.json)
CACHE_DIR="$PWD/.deno/npm/registry.npmjs.org/ts-graphviz/$VERSION"

tar xzf ../../ts-graphviz.tgz -C .

rm -rf $CACHE_DIR/*

mv ./package/* $CACHE_DIR

rm -rf ./package
