#!/bin/bash
set -e
TARGET="/Users/pcpc/Documents/GitHub/mates"
LINK="/Users/pcpc/Documents/GitHub/mates/mates-fullstack/example-app/node_modules/mates"
rm -rf "$LINK"
ln -s "$TARGET" "$LINK"
ls -la "$LINK/package.json"
