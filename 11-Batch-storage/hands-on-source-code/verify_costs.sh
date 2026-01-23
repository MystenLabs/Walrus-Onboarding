#!/bin/bash
set -e

# Configuration
SIZES=(10240 51200 102400 204800 512000 1048576) # 10KB, 50KB, 100KB, 200KB, 500KB, 1MB
COUNT=600
EPOCHS=1
CONTEXT="testnet"

# Helper to find walrus binary
WALRUS_BIN="walrus"
if ! command -v $WALRUS_BIN &> /dev/null; then
    echo "walrus binary not found in PATH."
    echo "Please ensure walrus CLI is installed and in your PATH."
    exit 1
fi

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is required but not installed."
    echo "Install with: brew install jq (macOS) or apt install jq (Ubuntu)"
    exit 1
fi

echo "Using walrus binary: $WALRUS_BIN"
echo "Context: $CONTEXT"

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
    GLOBAL_OPTS="--context $CONTEXT"
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
    # Use higher precision for calculation
    regular_wal_precise=$(awk "BEGIN {printf \"%.9f\", $total_regular_cost / 1000000000}")
    quilt_wal_precise=$(awk "BEGIN {printf \"%.9f\", $quilt_cost / 1000000000}")
    
    # Format display values (use more precision for small quilt costs)
    regular_wal=$(awk "BEGIN {printf \"%.3f\", $total_regular_cost / 1000000000}")
    if (( $(echo "$quilt_wal_precise < 0.001" | bc -l) )); then
        quilt_wal=$(awk "BEGIN {printf \"%.4f\", $quilt_cost / 1000000000}")
    else
        quilt_wal=$(awk "BEGIN {printf \"%.3f\", $quilt_cost / 1000000000}")
    fi
    
    # Calculate savings factor using precise values
    if (( $(echo "$quilt_wal_precise > 0" | bc -l) )); then
        factor=$(awk "BEGIN {printf \"%.0f\", $regular_wal_precise / $quilt_wal_precise}")
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

