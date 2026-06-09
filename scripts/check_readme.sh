#!/usr/bin/env bash
set -euo pipefail

if [ ! -f README.md ]; then
  echo "ERROR: README.md not found"
  exit 1
fi

words=$(wc -w < README.md || echo 0)
if [ "$words" -lt 3 ]; then
  echo "ERROR: README.md is too short ($words words)"
  exit 1
fi

echo "README.md looks good ($words words)"
exit 0
