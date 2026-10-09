#!/usr/bin/env sh
set -eu

# Match deployment.bat: compile both sites; commit and push separately.
CDPATH= cd -- "$(dirname -- "$0")"
exec npm run build
