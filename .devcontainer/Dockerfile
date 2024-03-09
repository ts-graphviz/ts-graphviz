FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye@sha256:56ef45a2c6f42f8ed6a4f03aebcb41e99a2841b22b2a4cd4633f375964ce1797

RUN apt-get update && apt-get install -y graphviz && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    rm -rf /var/lib/apt/lists/*
    curl -fsSL https://deno.land/x/install/install.sh | sh
