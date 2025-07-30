import { supabase } from "./supabase"

export interface RateRecord {
  id: string
  role: string
  base_rate: number
  region: string
  regional_multiplier: number
  seniority: string
  seniority_multiplier: number
  created_at?: string
}

export interface ExchangeRateRecord {
  id: string
  currency_code: string
  rate_to_aed: number
  updated_at: string
}

// Fallback data when database is not available
const fallbackRates: RateRecord[] = [
  // Database Developer
  {
    id: "1",
    role: "Database Developer",
    base_rate: 8000,
    region: "Euro Asia",
    regional_multiplier: 1.0,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    role: "Database Developer",
    base_rate: 8000,
    region: "Middle East",
    regional_multiplier: 1.15,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    role: "Database Developer",
    base_rate: 8000,
    region: "Europe",
    regional_multiplier: 1.3,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    role: "Database Developer",
    base_rate: 8000,
    region: "North America",
    regional_multiplier: 1.4,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },

  // Full Stack Developer
  {
    id: "5",
    role: "Full Stack Developer",
    base_rate: 10000,
    region: "Euro Asia",
    regional_multiplier: 1.0,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    role: "Full Stack Developer",
    base_rate: 10000,
    region: "Middle East",
    regional_multiplier: 1.15,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    role: "Full Stack Developer",
    base_rate: 10000,
    region: "Europe",
    regional_multiplier: 1.3,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "8",
    role: "Full Stack Developer",
    base_rate: 10000,
    region: "North America",
    regional_multiplier: 1.4,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },

  // Frontend Developer
  {
    id: "9",
    role: "Frontend Developer",
    base_rate: 9000,
    region: "Euro Asia",
    regional_multiplier: 1.0,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "10",
    role: "Frontend Developer",
    base_rate: 9000,
    region: "Middle East",
    regional_multiplier: 1.15,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "11",
    role: "Frontend Developer",
    base_rate: 9000,
    region: "Europe",
    regional_multiplier: 1.3,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "12",
    role: "Frontend Developer",
    base_rate: 9000,
    region: "North America",
    regional_multiplier: 1.4,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },

  // Backend Developer
  {
    id: "13",
    role: "Backend Developer",
    base_rate: 9500,
    region: "Euro Asia",
    regional_multiplier: 1.0,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "14",
    role: "Backend Developer",
    base_rate: 9500,
    region: "Middle East",
    regional_multiplier: 1.15,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "15",
    role: "Backend Developer",
    base_rate: 9500,
    region: "Europe",
    regional_multiplier: 1.3,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "16",
    role: "Backend Developer",
    base_rate: 9500,
    region: "North America",
    regional_multiplier: 1.4,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },

  // Quality Assurance
  {
    id: "17",
    role: "Quality Assurance",
    base_rate: 7000,
    region: "Euro Asia",
    regional_multiplier: 1.0,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "18",
    role: "Quality Assurance",
    base_rate: 7000,
    region: "Middle East",
    regional_multiplier: 1.15,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "19",
    role: "Quality Assurance",
    base_rate: 7000,
    region: "Europe",
    regional_multiplier: 1.3,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "20",
    role: "Quality Assurance",
    base_rate: 7000,
    region: "North America",
    regional_multiplier: 1.4,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },

  // Product Owner
  {
    id: "21",
    role: "Product Owner",
    base_rate: 12000,
    region: "Euro Asia",
    regional_multiplier: 1.0,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "22",
    role: "Product Owner",
    base_rate: 12000,
    region: "Middle East",
    regional_multiplier: 1.15,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "23",
    role: "Product Owner",
    base_rate: 12000,
    region: "Europe",
    regional_multiplier: 1.3,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: "24",
    role: "Product Owner",
    base_rate: 12000,
    region: "North America",
    regional_multiplier: 1.4,
    seniority: "intermediate",
    seniority_multiplier: 1.0,
    created_at: new Date().toISOString(),
  },
]

// Generate advanced and expert rates
const generateAllSeniorityRates = (): RateRecord[] => {
  const allRates: RateRecord[] = []

  fallbackRates.forEach((rate, index) => {
    // Intermediate (base)
    allRates.push(rate)

    // Advanced (1.25x multiplier)
    allRates.push({
      ...rate,
      id: `${rate.id}_advanced`,
      seniority: "advanced",
      seniority_multiplier: 1.25,
    })

    // Expert (1.6x multiplier)
    allRates.push({
      ...rate,
      id: `${rate.id}_expert`,
      seniority: "expert",
      seniority_multiplier: 1.6,
    })
  })

  return allRates
}

const fallbackExchangeRates: ExchangeRateRecord[] = [
  { id: "1", currency_code: "AED", rate_to_aed: 1.0, updated_at: new Date().toISOString() },
  { id: "2", currency_code: "USD", rate_to_aed: 0.27, updated_at: new Date().toISOString() },
  { id: "3", currency_code: "EUR", rate_to_aed: 0.25, updated_at: new Date().toISOString() },
  { id: "4", currency_code: "GBP", rate_to_aed: 0.21, updated_at: new Date().toISOString() },
  { id: "5", currency_code: "PKR", rate_to_aed: 76.5, updated_at: new Date().toISOString() },
]

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Fetch all rates from database or fallback
export async function fetchRates(): Promise<RateRecord[]> {
  if (!isSupabaseConfigured()) {
    console.log("Using fallback rate data (Supabase not configured)")
    return generateAllSeniorityRates()
  }

  try {
    const { data, error } = await supabase.from("rates").select("*").order("role", { ascending: true })

    if (error) {
      console.error("Error fetching rates from database:", error)
      console.log("Falling back to static rate data")
      return generateAllSeniorityRates()
    }

    if (!data || data.length === 0) {
      console.log("No data in database, using fallback rate data")
      return generateAllSeniorityRates()
    }

    return data.map(item => ({
      id: item.id.toString(),
      role: item.role,
      base_rate: item.base_rate,
      region: item.region,
      regional_multiplier: item.regional_multiplier,
      seniority: item.seniority,
      seniority_multiplier: item.seniority_multiplier,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error("Database connection error:", error)
    console.log("Using fallback rate data")
    return generateAllSeniorityRates()
  }
}

// Fetch exchange rates from database or fallback
export async function fetchExchangeRates(): Promise<ExchangeRateRecord[]> {
  if (!isSupabaseConfigured()) {
    console.log("Using fallback exchange rate data (Supabase not configured)")
    return fallbackExchangeRates
  }

  try {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .order("currency_code", { ascending: true })

    if (error) {
      console.error("Error fetching exchange rates from database:", error)
      console.log("Falling back to static exchange rate data")
      return fallbackExchangeRates
    }

    if (!data || data.length === 0) {
      console.log("No exchange rate data in database, using fallback data")
      return fallbackExchangeRates
    }

    return data
  } catch (error) {
    console.error("Database connection error:", error)
    console.log("Using fallback exchange rate data")
    return fallbackExchangeRates
  }
}

// Update exchange rate in database
export async function updateExchangeRate(currencyCode: string, rate: number) {
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, cannot update exchange rate")
    return false
  }

  try {
    const { error } = await supabase.from("exchange_rates").upsert({
      currency_code: currencyCode,
      rate_to_aed: rate,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating exchange rate:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

// Insert new rate record
export async function insertRate(rateData: Omit<RateRecord, "id" | "created_at">) {
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, cannot insert rate")
    return null
  }

  try {
    const { data, error } = await supabase.from("rates").insert([rateData]).select()

    if (error) {
      console.error("Error inserting rate:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Database connection error:", error)
    return null
  }
}

// Get unique roles from database or fallback
export async function getUniqueRoles(): Promise<string[]> {
  const rates = await fetchRates()
  const uniqueRoles = [...new Set(rates.map((item) => item.role))].sort()
  return uniqueRoles
}

// Get unique regions from database or fallback
export async function getUniqueRegions(): Promise<string[]> {
  const rates = await fetchRates()
  const uniqueRegions = [...new Set(rates.map((item) => item.region))].sort()
  return uniqueRegions
}

// Get unique seniority levels from database or fallback
export async function getUniqueSeniorityLevels(): Promise<string[]> {
  const rates = await fetchRates()
  const uniqueLevels = [...new Set(rates.map((item) => item.seniority))].sort()
  return uniqueLevels
}

// Fetch all roles from the database
export async function fetchRoles(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    console.log("Using fallback role data (Supabase not configured)")
    return [...new Set(fallbackRates.map(rate => rate.role))]
  }

  try {
    const { data, error } = await supabase
      .from("roles")
      .select("name")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching roles from database:", error)
      return [...new Set(fallbackRates.map(rate => rate.role))]
    }

    if (!data || data.length === 0) {
      console.log("No roles in database, using fallback data")
      return [...new Set(fallbackRates.map(rate => rate.role))]
    }

    return data.map(role => role.name)
  } catch (error) {
    console.error("Database connection error:", error)
    return [...new Set(fallbackRates.map(rate => rate.role))]
  }
}

// Fetch all regions from the database
export async function fetchRegions(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    console.log("Using fallback region data (Supabase not configured)")
    return [...new Set(fallbackRates.map(rate => rate.region))]
  }

  try {
    const { data, error } = await supabase
      .from("regions")
      .select("name")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching regions from database:", error)
      return [...new Set(fallbackRates.map(rate => rate.region))]
    }

    if (!data || data.length === 0) {
      console.log("No regions in database, using fallback data")
      return [...new Set(fallbackRates.map(rate => rate.region))]
    }

    return data.map(region => region.name)
  } catch (error) {
    console.error("Database connection error:", error)
    return [...new Set(fallbackRates.map(rate => rate.region))]
  }
}

// Fetch all seniority levels from the database
export async function fetchSeniorityLevels(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    console.log("Using fallback seniority data (Supabase not configured)")
    return [...new Set(fallbackRates.map(rate => rate.seniority))]
  }

  try {
    const { data, error } = await supabase
      .from("seniority_levels")
      .select("name")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching seniority levels from database:", error)
      return [...new Set(fallbackRates.map(rate => rate.seniority))]
    }

    if (!data || data.length === 0) {
      console.log("No seniority levels in database, using fallback data")
      return [...new Set(fallbackRates.map(rate => rate.seniority))]
    }

    return data.map(level => level.name)
  } catch (error) {
    console.error("Database connection error:", error)
    return [...new Set(fallbackRates.map(rate => rate.seniority))]
  }
}

// Get base rate for a specific role
export async function getBaseRateForRole(role: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    console.log("Using fallback base rate (Supabase not configured)")
    const roleData = fallbackRates.find(r => r.role === role)
    return roleData ? roleData.base_rate : 0
  }

  try {
    // First get the role ID
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", role)
      .single()

    if (roleError || !roleData) {
      console.error("Error fetching role ID:", roleError)
      const fallbackRole = fallbackRates.find(r => r.role === role)
      return fallbackRole ? fallbackRole.base_rate : 0
    }

    // For SWAT teams, we use Middle East region (default region_id=1) and Advanced seniority (default seniority_id=2)
    // Query rates table with all required parameters
    const { data: rateData, error: rateError } = await supabase
      .from("rates")
      .select("base_rate")
      .eq("role_id", roleData.id)
      .eq("region_id", 1)  // Middle East region (based on screenshot)
      .eq("seniority_level_id", 2)  // Advanced seniority (based on SWAT team requirements)

    if (rateError || !rateData || rateData.length === 0) {
      console.error("Error fetching base rate:", rateError)
      console.log("Query params:", { role_id: roleData.id, region_id: 1, seniority_level_id: 2 })
      const fallbackRole = fallbackRates.find(r => r.role === role)
      return fallbackRole ? fallbackRole.base_rate : 0
    }

    return rateData[0].base_rate
  } catch (error) {
    console.error("Database connection error:", error)
    const fallbackRole = fallbackRates.find(r => r.role === role)
    return fallbackRole ? fallbackRole.base_rate : 0
  }
}

// Get rate data for specific role, region and seniority
export async function getRateData(role: string, region: string, seniority: string): Promise<{ base_rate: number, regional_multiplier: number, seniority_multiplier: number } | null> {
  if (!isSupabaseConfigured()) {
    console.log("Using fallback rate data (Supabase not configured)")
    const rateData = fallbackRates.find(r => r.role === role && r.region === region && r.seniority === seniority)
    return rateData ? {
      base_rate: rateData.base_rate,
      regional_multiplier: rateData.regional_multiplier,
      seniority_multiplier: rateData.seniority_multiplier
    } : null
  }

  try {
    // Query the rates_view which combines all the necessary data
    const { data, error } = await supabase
      .from("rates_view")
      .select("*")
      .eq("role", role)
      .eq("region", region)
      .eq("seniority_level", seniority)
      .single()

    if (error || !data) {
      console.error("Error fetching rate data:", error)
      const fallbackData = fallbackRates.find(r => r.role === role && r.region === region && r.seniority === seniority)
      return fallbackData ? {
        base_rate: fallbackData.base_rate,
        regional_multiplier: fallbackData.regional_multiplier,
        seniority_multiplier: fallbackData.seniority_multiplier
      } : null
    }

    return {
      base_rate: data.base_rate,
      regional_multiplier: data.region_multiplier,
      seniority_multiplier: data.seniority_multiplier
    }
  } catch (error) {
    console.error("Database connection error:", error)
    const fallbackData = fallbackRates.find(r => r.role === role && r.region === region && r.seniority === seniority)
    return fallbackData ? {
      base_rate: fallbackData.base_rate,
      regional_multiplier: fallbackData.regional_multiplier,
      seniority_multiplier: fallbackData.seniority_multiplier
    } : null
  }
}
