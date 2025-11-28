#!/bin/bash
set -e

# Get script directory to find relative paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Check if we are in the project root or deep in docs
if [[ -f "$SCRIPT_DIR/Cargo.toml" ]]; then
    PROJECT_ROOT="$SCRIPT_DIR"
else
    # Assume we are in docs/book/curriculum/quilts/
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../" && pwd)"
fi

# Configuration
SIZES=(10240 51200 102400 204800 512000 1048576) # 10KB, 50KB, 100KB, 200KB, 500KB, 1MB
COUNT=600
EPOCHS=1
CONFIG_FILE="$PROJECT_ROOT/setup/client_config_testnet.yaml"

# Helper to find walrus binary
WALRUS_BIN="walrus"
if ! command -v $WALRUS_BIN &> /dev/null; then
    # Try cargo run wrapper or look in target
    if [[ -f "$PROJECT_ROOT/target/release/walrus" ]]; then
        WALRUS_BIN="$PROJECT_ROOT/target/release/walrus"
    else
        echo "walrus binary not found in PATH or target/release."
        echo "Please build it with 'cargo build --release' or ensure it's in PATH."
        exit 1
    fi
fi

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is required but not installed."
    exit 1
fi

echo "Using walrus binary: $WALRUS_BIN"
echo "Config file: $CONFIG_FILE"

# Create header for output
printf "| Blob Size | Regular Storage Cost (WAL) | Quilt Storage Cost (WAL) | Savings Factor |\n"
printf "|----------:|---------------------------:|-------------------------:|---------------:|\n"

# Work in a temp dir
WORK_DIR=$(mktemp -d)
echo "Working in: $WORK_DIR"

# Ensure cleanup on exit
trap "rm -rf $WORK_DIR" EXIT

cd "$WORK_DIR"

for size in "${SIZES[@]}"; do
    size_dir="size_${size}"
    mkdir -p "$size_dir"
    
    # Create base file
    dd if=/dev/urandom of="base_${size}" bs=$size count=1 status=none
    
    # Populate directory
    for i in $(seq 1 $COUNT); do
        cp "base_${size}" "$size_dir/file_$i.bin"
    done
    
    # Prepare options
    GLOBAL_OPTS=""
    if [[ -f "$CONFIG_FILE" ]]; then
        GLOBAL_OPTS="--config $CONFIG_FILE"
    fi
    SUB_OPTS="--epochs $EPOCHS --dry-run --json"
    
    # 1. Regular Storage Cost (Dry Run for 1 file * 600)
    regular_json=$($WALRUS_BIN $GLOBAL_OPTS store "$size_dir/file_1.bin" $SUB_OPTS 2>/dev/null)
    one_file_cost=$(echo "$regular_json" | jq -r '.[0].storageCost')
    
    if [[ "$one_file_cost" == "null" ]]; then
        echo "Error calculating regular cost for size $size"
        continue
    fi
    
    # Calculate total regular cost
    total_regular_cost=$((one_file_cost * COUNT))
    
    # 2. Quilt Storage Cost (Dry Run for directory)
    quilt_json=$($WALRUS_BIN $GLOBAL_OPTS store-quilt --paths "$size_dir" $SUB_OPTS 2>/dev/null)
    quilt_cost=$(echo "$quilt_json" | jq -r '.quiltBlobOutput.storageCost')
     
    if [[ "$quilt_cost" == "null" ]]; then
        quilt_cost=$(echo "$quilt_json" | jq -r '.storageCost')
    fi
    
    if [[ "$quilt_cost" == "null" || -z "$quilt_cost" ]]; then
        echo "Error calculating quilt cost for size $size"
        # echo "JSON Output: $quilt_json"
        continue
    fi
    
    # Convert to WAL (divide by 1,000,000,000)
    regular_wal=$(awk "BEGIN {printf \"%.3f\", $total_regular_cost / 1000000000}")
    quilt_wal=$(awk "BEGIN {printf \"%.3f\", $quilt_cost / 1000000000}")
    
    # Calculate savings factor
    if (( $(echo "$quilt_wal > 0" | bc -l) )); then
        factor=$(awk "BEGIN {printf \"%.0f\", $regular_wal / $quilt_wal}")
        factor_str="${factor}x"
    else
        factor_str="Inf"
    fi
    
    # Convert size to readable format
    if [[ $size -lt 1048576 ]]; then
        size_str="$((size/1024))KB"
    else
        size_str="$((size/1048576))MB"
    fi
    
    printf "| %9s | %26s | %24s | %14s |\n" "$size_str" "$regular_wal WAL" "$quilt_wal WAL" "$factor_str"
    
    # Cleanup directory to save space
    rm -rf "$size_dir" "base_${size}"
done

