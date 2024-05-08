FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye@sha256:e4ed4d7d418c422bbd9a0c8e7d0465c7030ef6743689ae5640491fe8b5cdc2d8

RUN apt-get update && apt-get install -y graphviz && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://deno.land/x/install/install.sh | sh
