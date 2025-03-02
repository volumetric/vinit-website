import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/slack_analyzer/types/supabase';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Use service role key for server-side operations to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Keep anon key for client-side operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.error('Supabase URL is not defined in environment variables.');
}

if (!supabaseServiceKey) {
  console.error('Supabase Service Role Key is not defined in environment variables. This is required for server-side operations that need to bypass RLS.');
}

// Create a client with the service role key for server-side operations
// This client will bypass RLS policies
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon key if service key is not available
  {
    auth: {
      persistSession: false, // Don't persist session in server environment
      autoRefreshToken: false,
    }
  }
);

// Helper function to handle errors
export function handleSupabaseError(error: any, operation: string): void {
  console.error(`Supabase error during ${operation}:`, error);
  throw new Error(`Error during ${operation}: ${error.message || 'Unknown error'}`);
} 