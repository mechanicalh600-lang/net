import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent runtime crashes if env is undefined
// This handles cases where import.meta.env might not be populated immediately
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

// Create client with fallback values to prevent initialization crash
// API calls will fail if keys are invalid, but the app will render
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);