FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye@sha256:76fea418f6f051f971010c92915fbd39341315ca03c2b8dbec59e15484ee9759

RUN apt-get update && apt-get install -y graphviz && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://deno.land/x/install/install.sh | sh
