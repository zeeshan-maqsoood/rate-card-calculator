import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL is not set. Database features will be disabled.")
}

if (!supabaseAnonKey) {
  console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Database features will be disabled.")
}

// Create a mock client if environment variables are missing
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: new Error("Supabase not configured") }),
    insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    upsert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
  }),
})

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createMockClient()

// Database types
export interface RateData {
  id: string
  role: string
  base_rate: number
  region: string
  regional_multiplier: number
  seniority: string
  seniority_multiplier: number
  created_at: string
}

export interface ExchangeRate {
  id: string
  currency_code: string
  rate_to_aed: number
  updated_at: string
}
