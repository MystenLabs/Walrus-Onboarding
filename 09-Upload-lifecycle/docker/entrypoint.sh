#!/bin/bash
# Entrypoint script for Walrus lifecycle lab
# Automatically patches Sui wallet config paths for container environment

MOUNTED_WALLET_DIR="/home/student/.sui/sui_config_mounted"
TARGET_WALLET_DIR="/home/student/.sui/sui_config"

# Check if wallet directory exists and has client.yaml
if [ -f "$MOUNTED_WALLET_DIR/client.yaml" ]; then
    echo "Patching Sui wallet configuration for container environment..."
    
    # Create target wallet directory (this is where walrus expects it)
    mkdir -p "$TARGET_WALLET_DIR"
    
    # Copy all wallet files to the target location
    cp "$MOUNTED_WALLET_DIR/"* "$TARGET_WALLET_DIR/" 2>/dev/null || true
    
    # Patch the client.yaml to use the container path for keystore
    sed -E "s|File: .*/sui.keystore|File: $TARGET_WALLET_DIR/sui.keystore|g" \
        "$MOUNTED_WALLET_DIR/client.yaml" > "$TARGET_WALLET_DIR/client.yaml"
    
    echo "✓ Wallet configuration patched successfully"
    echo "  Mounted from: $MOUNTED_WALLET_DIR (read-only)"
    echo "  Available at: $TARGET_WALLET_DIR"
else
    echo "⚠ No Sui wallet found at $MOUNTED_WALLET_DIR/client.yaml"
    echo "  Mount your wallet with: SUI_WALLET_PATH=/path/to/.sui/sui_config"
fi

echo ""

# Execute the command passed to the container
exec "$@"
