#!/bin/sh
# The Raycast store toolchain is npm-only and refuses to run while pnpm
# files exist in the extension directory. Local development stays on pnpm,
# so stash the pnpm files outside the repo for the duration of the publish.
set -e

STASH=$(mktemp -d)
restore() {
  for f in pnpm-lock.yaml pnpm-workspace.yaml; do
    [ -f "$STASH/$f" ] && mv "$STASH/$f" .
  done
  rmdir "$STASH" 2>/dev/null || true
}
trap restore EXIT

for f in pnpm-lock.yaml pnpm-workspace.yaml; do
  [ -f "$f" ] && mv "$f" "$STASH/"
done

ray publish "$@"
