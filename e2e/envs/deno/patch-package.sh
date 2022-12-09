#/bin/bash

VERSION=`cat ../../../package.json | jq -r .version`

tar xzf ../../ts-graphviz.tgz -C .

rm -rf $PWD/.deno/npm/registry.npmjs.org/ts-graphviz/$VERSION/*

mv ./package/* $PWD/.deno/npm/registry.npmjs.org/ts-graphviz/$VERSION

rm -rf ./package
