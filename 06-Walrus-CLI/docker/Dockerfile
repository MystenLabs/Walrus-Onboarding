# Dockerfile for CLI Module Hands-On Exercises
# Use Ubuntu 24.04 for GLIBC 2.39 compatibility (required by walrus binary)
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install necessary tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    jq \
    diffutils \
    coreutils \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Install Walrus CLI (Testnet)
RUN curl -sSf https://install.wal.app | sh -s -- -n testnet -i /usr/local/bin \
    && chmod +x /usr/local/bin/walrus

WORKDIR /workspace

# Create non-root user
RUN useradd -m -s /bin/bash student && \
    mkdir -p /home/student/.config/walrus && \
    chown -R student:student /home/student /workspace

# Download testnet configuration
RUN curl -sSf https://docs.wal.app/setup/client_config_testnet.yaml \
    -o /home/student/.config/walrus/client_config.yaml && \
    chown -R student:student /home/student/.config/walrus

USER student
ENV HOME=/home/student

# Verify installation
RUN walrus --version

CMD ["/bin/bash"]

