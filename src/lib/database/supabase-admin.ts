import { createClient } from "@supabase/supabase-js"

// Admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Function to initialize database with sample data
export async function initializeDatabase() {
  if (!supabaseAdmin) {
    console.log("Admin client not available")
    return false
  }

  try {
    // Check if data already exists
    const { data: existingRates } = await supabaseAdmin.from("rates").select("id").limit(1)

    if (existingRates && existingRates.length > 0) {
      console.log("Database already initialized")
      return true
    }

    console.log("Initializing database with sample data...")

    // This would run the SQL scripts programmatically if needed
    // For now, we'll rely on manual SQL execution

    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    return false
  }
}
