# Dockerfile for Upload Transaction Lifecycle Module
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl wget ca-certificates jq diffutils coreutils bash \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSf https://install.wal.app | sh -s -- -n testnet -i /usr/local/bin \
    && chmod +x /usr/local/bin/walrus

WORKDIR /workspace

RUN useradd -m -s /bin/bash student && \
    mkdir -p /home/student/.config/walrus && \
    chown -R student:student /home/student /workspace

RUN curl -sSf https://docs.wal.app/setup/client_config_testnet.yaml \
    -o /home/student/.config/walrus/client_config.yaml && \
    chown -R student:student /home/student/.config/walrus

USER student
ENV HOME=/home/student

RUN walrus --version

CMD ["/bin/bash"]

