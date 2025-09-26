import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Don't throw error, just log it to prevent app crash
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export type UserProfile = {
  id: string;
  role: 'farmer' | 'customer';
  full_name: string;
  farm_name?: string;
  created_at: string;
};

export type Product = {
  id: string;
  farmer_id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  prepared_date: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
  user_profiles?: UserProfile;
};