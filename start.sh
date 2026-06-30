#!/bin/sh
# Write CLERK_SECRET_KEY to .env for the server to read
echo "CLERK_SECRET_KEY=$CLERK_SECRET_KEY" > /app/.env
exec node server.js
