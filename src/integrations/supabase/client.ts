import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables for Supabase configuration
// These must be set in your deployment platform (Vercel, Netlify, etc.)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please set it in your .env file or deployment platform.'
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable. ' +
    'Please set it in your .env file or deployment platform.'
  );
}

// Create and export the Supabase client
// Import like this: import { supabase } from "@/integrations/supabase/client";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
