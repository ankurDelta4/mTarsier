#!/usr/bin/env bash
# Builds the tsr binary and copies it to binaries/tsr-{triple}.
# Run once before `pnpm tauri dev`, and automatically via beforeBundleCommand.
#
# Usage:
#   bash scripts/prepare-sidecar.sh          # debug (default)
#   bash scripts/prepare-sidecar.sh release  # release

set -e

TRIPLE=$(rustc -vV | sed -n 's/host: //p')
PROFILE="${1:-debug}"

mkdir -p binaries

# Tauri's build.rs validates that the sidecar file exists before compiling.
# Touch a placeholder so the check passes, then overwrite with the real binary.
touch "binaries/tsr-$TRIPLE"

echo "Building tsr ($PROFILE) for $TRIPLE..."

if [ "$PROFILE" = "release" ]; then
  cargo build --release --bin tsr
  cp "target/release/tsr" "binaries/tsr-$TRIPLE"
else
  cargo build --bin tsr
  cp "target/debug/tsr" "binaries/tsr-$TRIPLE"
fi

chmod +x "binaries/tsr-$TRIPLE"
echo "✓  binaries/tsr-$TRIPLE ready"
