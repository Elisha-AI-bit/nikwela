import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';


const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZGhpcHZ1Ym9sa2hvcml4cmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDUxODUsImV4cCI6MjA3MDU4MTE4NX0.AUCktrTEs4mr7mPOP8CjRTkXsd6ibiJ1jfLU6WvVfUI';

const supabaseUrl = 'https://vhdhipvubolkhorixrhr.supabase.co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database schema types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'commuter' | 'driver' | 'admin';
  phone: string;
  avatar_url?: string;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  estimated_time: number;
  created_at: string;
}

export interface Stop {
  id: string;
  route_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order_index: number;
  created_at: string;
}

export interface Fare {
  id: string;
  route_id: string;
  amount: number;
  currency: string;
  created_at: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  route_id: string;
  status: 'active' | 'completed' | 'cancelled';
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  trip_id: string;
  user_id: string;
  amount: number;
  method: 'mtn_money' | 'airtel_money' | 'zamtel_kwacha' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  transaction_ref: string;
  created_at: string;
}

export interface Location {
  id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  created_at: string;
}