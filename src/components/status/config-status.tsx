"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Database } from "lucide-react"

export function ConfigStatus() {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConfiguration = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      setIsSupabaseConfigured(!!(supabaseUrl && supabaseKey))
      setIsChecking(false)
    }

    checkConfiguration()
  }, [])

  if (isChecking) {
    return null
  }

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Database Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Using Demo Data</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isSupabaseConfigured
                ? "Connected to Supabase database with live data"
                : "Supabase not configured. Using fallback data for demonstration."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
