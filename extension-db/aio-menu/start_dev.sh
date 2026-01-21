#!/bin/bash

# Chrome Binary Path
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Ensure we are in the script's directory
cd "$(dirname "$0")"
REAL_EXTENSION_DIR="$(pwd -P)"

# Use User's Downloads folder to avoid /tmp restrictions
# This is much safer on macOS
DEBUG_DIR="$HOME/Downloads/hello_extension_debug"
PROFILE_DIR="$HOME/Downloads/hello_extension_profile"

echo "=========================================="
echo "Cleaning up old debug files..."
rm -rf "$DEBUG_DIR"
rm -rf "$PROFILE_DIR"

echo "Preparing Extension in: $DEBUG_DIR"
mkdir -p "$DEBUG_DIR"
cp -R "$REAL_EXTENSION_DIR/"* "$DEBUG_DIR/"

echo "Removing quarantine..."
xattr -cr "$DEBUG_DIR" 2>/dev/null || true

# 3. Launch Chrome DIRECTLY
# We use the binary directly because 'open' on macOS sometimes drops arguments
# even with --args. Using the binary is 100% reliable for flags.
echo "Launching Google Chrome Binary..."
echo "Extension Path: $DEBUG_DIR"
echo "Profile Path:   $PROFILE_DIR"

"$CHROME_BIN" \
    --load-extension="$DEBUG_DIR" \
    --user-data-dir="$PROFILE_DIR" \
    --no-first-run \
    --no-default-browser-check \
    "chrome://extensions" &

PID=$!
echo "Chrome started with PID: $PID"

