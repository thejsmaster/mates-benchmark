#!/bin/bash
cd /Users/pcpc/Documents/GitHub/mates/mates-fullstack/example-app
rm -rf node_modules/mates
ln -s /Users/pcpc/Documents/GitHub/mates node_modules/mates
echo "Symlink created:"
ls -la node_modules/mates/package.json
