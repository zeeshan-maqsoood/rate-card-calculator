"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Database, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/database/supabase"

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [recordCount, setRecordCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const checkDatabaseStatus = async () => {
    setIsChecking(true)
    setError(null)

    try {
      // Test connection by fetching a small amount of data
      const { data: rates, error: ratesError } = await supabase.from("rates").select("id").limit(1)

      if (ratesError) {
        throw ratesError
      }

      // Get total count
      const { count, error: countError } = await supabase.from("rates").select("*", { count: "exact", head: true })

      if (countError) {
        throw countError
      }

      setIsConnected(true)
      setRecordCount(count || 0)
    } catch (err: any) {
      setIsConnected(false)
      setError(err.message || "Connection failed")
      console.error("Database connection error:", err)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Checking connection...</span>
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Database Connected ({recordCount} rates loaded)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Connection Failed</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                {isConnected
                  ? "Connected to Supabase database with live data"
                  : error
                    ? `Error: ${error}`
                    : "Unable to connect to database"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkDatabaseStatus}
            disabled={isChecking}
            className="ml-4 bg-transparent dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
