#!/usr/bin/env sh
set -e

# If INSTANCE_CONNECTION_NAME is provided, start the Cloud SQL Auth Proxy in background
if [ -n "${INSTANCE_CONNECTION_NAME:-}" ]; then
  /usr/local/bin/cloud-sql-proxy "${INSTANCE_CONNECTION_NAME}" >/proc/1/fd/1 2>/proc/1/fd/2 &
fi

# Execute the main container command
exec "$@"