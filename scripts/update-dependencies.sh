#!/usr/bin/env sh
npx npm-check-updates -f @types/node -t minor -u
npx npm-check-updates -x @types/node -u
npm install
npm update
