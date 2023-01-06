#!/bin/bash
rm -f yarn.lock ts-graphviz.tgz
yarn cache clean --all ts-graphviz
yarn --cwd .. build
yarn --cwd .. pack -f ts-graphviz.tgz
yarn install --no-lockfile

yarn run tsc main.ts -m commonjs --outDir envs/cjs/ --target esnext
yarn run tsc main.ts -m nodenext --outDir envs/esm/ --target esnext
sed s/'ts-graphviz'/'npm:ts-graphviz'/ < main.ts > envs/deno/main.ts
cp main.ts envs/webpack-build-node/src
cp main.ts envs/webpack-build-web/src
