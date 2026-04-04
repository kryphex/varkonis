# VARKONIS

## Supabase database setup (profiles table)

Auth pages under `auth/` now read/write a `profiles` table in Supabase:

- `auth/signup.html` upserts a row into `public.profiles` after successful signup.
- `auth/login.html` fetches the signed-in user's `public.profiles` row.

To enable this, run:

1. Open Supabase SQL Editor for your project.
2. Run `supabase/profiles.sql`.

This creates:

- `public.profiles` table
- `updated_at` trigger
- RLS policies restricting read/write access to the authenticated user's own email
