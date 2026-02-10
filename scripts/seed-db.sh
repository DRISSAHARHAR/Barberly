#!/usr/bin/env bash
set -euo pipefail
cd apps/api
npx prisma db seed
