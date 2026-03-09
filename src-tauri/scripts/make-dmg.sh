#!/usr/bin/env bash
# Creates a signed DMG from the built .app
# Run after `pnpm tauri build`
#
# Usage:
#   APPLE_SIGNING_IDENTITY="Developer ID Application: Rohit Joshi (QH5DK6W8KK)" bash scripts/make-dmg.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE_DIR="$SCRIPT_DIR/../target/release/bundle/macos"
APP_PATH="$BUNDLE_DIR/mTarsier.app"
VERSION=$(defaults read "$APP_PATH/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo "0.1.0")
ARCH=$(uname -m)
DMG_NAME="mTarsier_${VERSION}_${ARCH}.dmg"
DMG_OUT="$BUNDLE_DIR/$DMG_NAME"

if [[ ! -d "$APP_PATH" ]]; then
  echo "Error: $APP_PATH not found. Run 'pnpm tauri build' first."
  exit 1
fi

echo "Creating DMG for $APP_PATH..."

# create-dmg needs a staging folder, not the .app directly
STAGING_DIR=$(mktemp -d)
cp -R "$APP_PATH" "$STAGING_DIR/"

# Remove old DMG if exists
rm -f "$DMG_OUT"

create-dmg \
  --volname "mTarsier" \
  --filesystem APFS \
  --window-pos 200 120 \
  --window-size 600 380 \
  --icon-size 100 \
  --icon "mTarsier.app" 175 192 \
  --hide-extension "mTarsier.app" \
  --app-drop-link 425 192 \
  --no-internet-enable \
  ${APPLE_SIGNING_IDENTITY:+--codesign "$APPLE_SIGNING_IDENTITY"} \
  "$DMG_OUT" \
  "$STAGING_DIR"

rm -rf "$STAGING_DIR"

echo "✓ DMG created: $DMG_OUT"
