import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Reads the anon key + URL from env vars — see
 * .env.local.example. The anon key is safe to ship to the client: every
 * sensitive mutation (coins, username, card ownership) is locked down by
 * Row Level Security + SECURITY DEFINER functions on the database side, not
 * by hiding this key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
