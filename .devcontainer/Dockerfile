FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye@sha256:5b0f54787469b1336d5f29ac2e96d929b9bd26fcc561cad9c0035487ab76a343

RUN apt-get update && apt-get install -y graphviz && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://deno.land/x/install/install.sh | sh
