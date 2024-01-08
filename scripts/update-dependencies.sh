#!/usr/bin/env sh

EXCLUDE="@types/node"

pnpm exec npm-check-updates -x "$EXCLUDE" -u
pnpm install
pnpm update
