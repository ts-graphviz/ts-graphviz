# The image `pnpm test:sandbox` (scripts/test-sandbox.ts) runs the tests
# tagged `process` in: Node.js and Graphviz, nothing else. The repository,
# with the node_modules installed on the host, is mounted read-only at run
# time; nothing of it is copied in.
#
# NODE_MAJOR picks the Node.js release line; the script passes the major
# version of the Node.js that runs it. Each base image is pinned by digest
# (a multi-platform index); update the digests together, e.g. with
# `docker buildx imagetools inspect node:24-trixie-slim`.
ARG NODE_MAJOR=24

FROM node:22-trixie-slim@sha256:2117f713a417f3aff682ac8f5bc2ebbdf1beed51f36e67ab1e0fd3866b6d2d8f AS node-22
FROM node:24-trixie-slim@sha256:89c5244bc22a9bc3287d89ebc7e49b9cb5bb84cd40e6175ac3421d5a9f68b95a AS node-24
FROM node:26-trixie-slim@sha256:94816674c62774da0d099a947bf4613b9e1972a2733abd0d0cd80e795f8411d0 AS node-26

# hadolint ignore=DL3006
FROM node-${NODE_MAJOR}
# Graphviz from the Debian release of the base image (2.42 in trixie, the
# line Ubuntu 24.04 has in CI). Its version is fixed by the base image's
# digest and the Debian archive, not pinned here: Debian replaces a package
# version in a stable release when it updates it, so a pinned version would
# stop installing.
# hadolint ignore=DL3008
RUN apt-get update \
  && apt-get install -y --no-install-recommends graphviz \
  && rm -rf /var/lib/apt/lists/* \
  && dot -V
