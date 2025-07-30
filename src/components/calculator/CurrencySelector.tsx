"use client"

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getExchangeRates, type Currency } from '@/lib/calculator/currency'

interface CurrencySelectorProps {
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
  className?: string
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange, className }: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Record<string, Currency>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch exchange rates on component mount and every hour
  useEffect(() => {
    let isMounted = true
    const fetchRates = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const rates = await getExchangeRates()
        
        if (isMounted) {
          setCurrencies(rates)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error fetching exchange rates:', err)
        if (isMounted) {
          setError('Failed to load exchange rates')
          setIsLoading(false)
        }
      }
    }

    // Fetch immediately
    fetchRates()

    // Set up interval to refresh rates every hour
    const intervalId = setInterval(fetchRates, 60 * 60 * 1000)

    // Cleanup
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div className={`relative ${className || ''}`}>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-full h-7 px-3 py-0 bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-white/20 dark:border-slate-700 rounded-lg hover:bg-white/90 dark:hover:bg-slate-700 focus:ring-1 focus:ring-white/50">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-3 h-3 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-purple-600 dark:border-t-purple-400" />
            ) : (
              <span className="text-sm">{currencies[selectedCurrency]?.flag}</span>
            )}
            <span className="text-xs font-medium">{selectedCurrency}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-lg rounded-md">
          {Object.values(currencies).map((currency) => (
            <SelectItem 
              key={currency.code} 
              value={currency.code}
              className="hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700 py-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{currency.flag}</span>
                <span className="text-xs font-medium text-gray-800 dark:text-white">{currency.code}</span>
              </div>
            </SelectItem>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center py-1">
              <div className="w-3 h-3 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-purple-600 dark:border-t-purple-400" />
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Loading...</span>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-xs p-1">
              {error}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
