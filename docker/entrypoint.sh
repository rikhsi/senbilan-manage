#!/bin/sh
set -eu

CONFIG=/usr/share/nginx/html/assets/config.json
API_BASE_URL="${API_BASE_URL:-https://api.senbilan.uz}"
SENTRY_ENABLED="${SENTRY_ENABLED:-false}"
SENTRY_DSN="${SENTRY_DSN:-}"
SENTRY_ENVIRONMENT="${SENTRY_ENVIRONMENT:-production}"

case "$API_BASE_URL" in
  *\"* | *\\* | *' '*)
    echo "API_BASE_URL must be a URL without spaces, quotes, or backslashes" >&2
    exit 1
    ;;
esac

case "$SENTRY_DSN" in
  *\"* | *\\*)
    echo "SENTRY_DSN must not contain quotes or backslashes" >&2
    exit 1
    ;;
esac

case "$SENTRY_ENABLED" in
  true | false) ;;
  *)
    echo "SENTRY_ENABLED must be true or false" >&2
    exit 1
    ;;
esac

case "$SENTRY_ENVIRONMENT" in
  development | staging | production) ;;
  *)
    echo "SENTRY_ENVIRONMENT must be development, staging, or production" >&2
    exit 1
    ;;
esac

mkdir -p "$(dirname "$CONFIG")"
cat >"$CONFIG" <<EOF
{
  "apiBaseUrl": "${API_BASE_URL}",
  "sentry": {
    "enabled": ${SENTRY_ENABLED},
    "dsn": "${SENTRY_DSN}",
    "environment": "${SENTRY_ENVIRONMENT}"
  },
  "features": {
    "mockApi": false
  }
}
EOF

exec "$@"
