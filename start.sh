#!/bin/sh
# Load environment variables into a .env file for Next.js standalone server
# This ensures CLERK_SECRET_KEY is available to server components and middleware

# CLERK_SECRET_KEY must be quoted to prevent issues with special characters
printf "CLERK_SECRET_KEY=%s\n" "$CLERK_SECRET_KEY" > /app/.env
printf "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=%s\n" "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" >> /app/.env
printf "NEXT_PUBLIC_CLERK_SIGN_IN_URL=%s\n" "$NEXT_PUBLIC_CLERK_SIGN_IN_URL" >> /app/.env
printf "NEXT_PUBLIC_CLERK_SIGN_UP_URL=%s\n" "$NEXT_PUBLIC_CLERK_SIGN_UP_URL" >> /app/.env
printf "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=%s\n" "$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" >> /app/.env
printf "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=%s\n" "$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" >> /app/.env
printf "NEXT_PUBLIC_APP_URL=%s\n" "$NEXT_PUBLIC_APP_URL" >> /app/.env
printf "DATABASE_URL=%s\n" "$DATABASE_URL" >> /app/.env

# Start the Next.js server
exec node server.js
