FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye@sha256:e4d6f62b9bd347496e7b933a5a9bd15b67411cec4110af6d4f206322890d3572

RUN apt-get update && apt-get install -y graphviz && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://deno.land/x/install/install.sh | sh
