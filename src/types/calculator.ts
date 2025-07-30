// Calculator parameter types
export interface RateCalculatorParams {
  role: string
  workload: string
  duration: string
  region: string
  seniority: string
}

// Options for workload selection
export interface WorkloadOption {
  id: string
  label: string
  percentage: number
  display: string
}

// Options for duration selection
export interface DurationOption {
  id: string
  label: string
  discount: number
  display: string
}

// Rate data structure from database
export interface RateData {
  base_rate: number
  regional_multiplier: number
  seniority_multiplier: number
}

// Props for the useRateCalculator hook
export interface UseRateCalculatorProps {
  selectedCurrency: string
  exchangeRates: { [key: string]: number }
  onRateChange?: (customRate: number, swatRate: number, params?: RateCalculatorParams) => void
}

// Props for the RateCalculator component
export interface RateCalculatorProps {
  selectedCurrency: string
  exchangeRates: { [key: string]: number }
  onRateChange?: (customRate: number, swatRate: number, params?: any) => void
}
