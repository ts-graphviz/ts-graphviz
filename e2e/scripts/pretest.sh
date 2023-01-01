#!/bin/bash
rm -f yarn.lock ts-graphviz.tgz
yarn cache clean --all ts-graphviz
yarn --cwd .. build
yarn --cwd .. pack -f ts-graphviz.tgz
yarn install --no-lockfile

yarn pretest:cjs
yarn pretest:esm
yarn pretest:deno
yarn pretest:webpack-build
