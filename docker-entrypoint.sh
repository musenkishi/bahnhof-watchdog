#!/bin/sh
set -e

# Check if PUID and PGID are set and not equal to empty string
if [ -n "$PUID" ] && [ -n "$PGID" ]; then
    # Validate PUID
    if ! echo "$PUID" | grep -Eq '^[0-9]+$'; then
        echo "Invalid PUID: $PUID"
        exit 1
    fi

    # Validate PGID
    if ! echo "$PGID" | grep -Eq '^[0-9]+$'; then
        echo "Invalid PGID: $PGID"
        exit 1
    fi

    # Resolve group
    newgroup=$(getent group $PGID | cut -d: -f1)
    if [ -z "$newgroup" ]; then
        addgroup -g $PGID newgroup
        newgroup="newgroup"
    fi

    # Resolve user
    existing_user=$(getent passwd $PUID | cut -d: -f1)
    if [ -z "$existing_user" ]; then
        adduser -u $PUID -G $newgroup -s /bin/sh -D newuser
        existing_user="newuser"
        chown -R $existing_user:$newgroup /usr/src/app
        if [ -d /data ]; then
            chown -R $existing_user:$newgroup /data
        fi
    fi

    exec su-exec $existing_user:$newgroup "$@"
else
    exec "$@"
fi

# Fallback
exec "$@"
