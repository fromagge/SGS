import { Database } from 'supabase/supabase';

export type User = Database['public']['Tables']['users']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
