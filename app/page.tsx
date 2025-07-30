"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getExchangeRates, convertCurrency, formatCurrency } from "@/lib/calculator/currency"
import { CurrencySelector } from "@/components/calculator/CurrencySelector"
import { RateCalculator } from "@/components/calculator/rate-calculator"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { Volume2, Download, Mail, Globe } from "lucide-react"

interface EmailData {
  name: string
  email: string
  company: string
  message: string
}

export default function Component() {
  const [selectedCurrency, setSelectedCurrency] = useState("AED")
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    AED: 1.0,
    USD: 0.272,
    EUR: 0.25,
    GBP: 0.21,
    PKR: 76.5,
  })
  const [isRatesLoading, setIsRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState<string | null>(null)
  const [customRate, setCustomRate] = useState(0)
  const [swatRate, setSwatRate] = useState(0)
  const [calculatorParams, setCalculatorParams] = useState({
    role: '',
    workload: '',
    duration: '',
    region: '',
    seniority: ''
  })
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailData, setEmailData] = useState<EmailData>({
    name: "",
    email: "",
    company: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch exchange rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsRatesLoading(true)
        setRatesError(null)
        
        const rates = await getExchangeRates()
        
        // Convert to simple rate object for the calculator
        const simpleRates: Record<string, number> = {}
        Object.entries(rates).forEach(([code, currency]) => {
          simpleRates[code] = currency.rate
        })
        
        setExchangeRates(simpleRates)
        setIsRatesLoading(false)
      } catch (error) {
        console.error("Error fetching exchange rates:", error)
        setRatesError("Failed to load exchange rates")
        setIsRatesLoading(false)
      }
    }

    fetchRates()
    
    // Refresh rates every hour
    const intervalId = setInterval(fetchRates, 60 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [])

  // Handle rate changes from calculator
  const handleRateChange = (newCustomRate: number, newSwatRate: number, params?: any) => {
    setCustomRate(newCustomRate)
    setSwatRate(newSwatRate)
    
    // Update calculator parameters if provided
    if (params) {
      setCalculatorParams(params);
    }
  }

  // Handle email form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Debug log the rates before formatting
      console.log("Before formatting - Custom Rate:", customRate, "SWAT Rate:", swatRate);
      
      // DIRECT FIX: Ensure we have a valid SWAT rate
      // If swatRate is 0, NaN, or undefined, calculate a fallback SWAT rate
      let validSwatRate = swatRate;
      if (!validSwatRate || isNaN(validSwatRate) || validSwatRate <= 0) {
        console.log("SWAT rate is invalid, using fallback calculation");
        // Use a fallback base rate of 1000 AED
        const baseRate = 1000;
        const seniorityMultiplier = 1.25;
        const workloadMultiplier = 1.0; // Full-time
        const durationDiscount = 0.0; // No discount
        const swatDiscount = 0.2; // 20% pre-negotiated discount
        
        const rateAfterSeniority = baseRate * seniorityMultiplier;
        const rateAfterWorkload = rateAfterSeniority * workloadMultiplier;
        const rateAfterDuration = rateAfterWorkload * (1 - durationDiscount);
        const finalRate = rateAfterDuration * (1 - swatDiscount);
        validSwatRate = finalRate * (exchangeRates[selectedCurrency] || 1);
        
        console.log("Fallback SWAT rate calculated:", validSwatRate);
      }
      
      // Ensure custom rate is valid too
      const validCustomRate = isNaN(customRate) || customRate <= 0 ? 12000 : customRate;
      
      // Format the rates for the email
      const formattedCustomRate = formatCurrency(validCustomRate, selectedCurrency, {
        [selectedCurrency]: { 
          code: selectedCurrency, 
          rate: exchangeRates[selectedCurrency], 
          symbol: selectedCurrency === 'USD' ? '$' : 
                 selectedCurrency === 'EUR' ? '€' : 
                 selectedCurrency === 'GBP' ? '£' : 
                 selectedCurrency === 'PKR' ? '₨' : 'AED',
          flag: ''
        }
      })
      
      const formattedSwatRate = formatCurrency(validSwatRate, selectedCurrency, {
        [selectedCurrency]: { 
          code: selectedCurrency, 
          rate: exchangeRates[selectedCurrency], 
          symbol: selectedCurrency === 'USD' ? '$' : 
                 selectedCurrency === 'EUR' ? '€' : 
                 selectedCurrency === 'GBP' ? '£' : 
                 selectedCurrency === 'PKR' ? '₨' : 'AED',
          flag: ''
        }
      })
      
      // Debug log the formatted rates
      console.log("After formatting - Custom Rate:", formattedCustomRate, "SWAT Rate:", formattedSwatRate);

      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...emailData,
          customRate: formattedCustomRate,
          swatRate: formattedSwatRate,
          currency: selectedCurrency,
          calculatorParams: calculatorParams
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      toast.success("Quote sent successfully! We'll be in touch soon.")
      setShowEmailForm(false)
      setEmailData({
        name: "",
        email: "",
        company: "",
        message: "",
      })
    } catch (error) {
      console.error("Error sending quote:", error)
      toast.error("Failed to send quote. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Send email quote
  const sendEmailQuote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...emailData,
          customRate: formatCurrency(customRate, selectedCurrency, {
            [selectedCurrency]: { 
              code: selectedCurrency, 
              rate: exchangeRates[selectedCurrency], 
              symbol: selectedCurrency === 'USD' ? '$' : 
                     selectedCurrency === 'EUR' ? '€' : 
                     selectedCurrency === 'GBP' ? '£' : 
                     selectedCurrency === 'PKR' ? '₨' : 'AED',
              flag: ''
            }
          }),
          swatRate: formatCurrency(swatRate, selectedCurrency, {
            [selectedCurrency]: { 
              code: selectedCurrency, 
              rate: exchangeRates[selectedCurrency], 
              symbol: selectedCurrency === 'USD' ? '$' : 
                     selectedCurrency === 'EUR' ? '€' : 
                     selectedCurrency === 'GBP' ? '£' : 
                     selectedCurrency === 'PKR' ? '₨' : 'AED',
              flag: ''
            }
          }),
          currency: selectedCurrency,
          calculatorParams: calculatorParams
        }),
      })

      if (response.ok) {
        toast({
          title: "Quote Sent Successfully!",
          description: "Your rate card has been sent to your email address.",
        })
        setShowEmailForm(false)
        setEmailData({ name: "", email: "", company: "", message: "" })
      } else {
        throw new Error("Failed to send email")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate PDF
  const generatePDF = async () => {
    setIsLoading(true)
    try {
      // Ensure we have valid configuration data
      const swatConfig = {
        role: calculatorParams.role || 'Software Engineer',
        workload: calculatorParams.workload || 'Full-time',
        duration: calculatorParams.duration || '1-3 months',
        currency: selectedCurrency
      };
      
      const customConfig = {
        role: calculatorParams.role || 'Software Engineer',
        region: calculatorParams.region || 'Middle East',
        seniority: calculatorParams.seniority || 'Advanced',
        currency: selectedCurrency
      };
      
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customRate: formatCurrency(customRate, selectedCurrency, {
            [selectedCurrency]: { 
              code: selectedCurrency, 
              rate: exchangeRates[selectedCurrency], 
              symbol: selectedCurrency === 'USD' ? '$' : 
                     selectedCurrency === 'EUR' ? '€' : 
                     selectedCurrency === 'GBP' ? '£' : 
                     selectedCurrency === 'PKR' ? '₨' : 'AED',
              flag: ''
            }
          }),
          swatRate: formatCurrency(swatRate, selectedCurrency, {
            [selectedCurrency]: { 
              code: selectedCurrency, 
              rate: exchangeRates[selectedCurrency], 
              symbol: selectedCurrency === 'USD' ? '$' : 
                     selectedCurrency === 'EUR' ? '€' : 
                     selectedCurrency === 'GBP' ? '£' : 
                     selectedCurrency === 'PKR' ? '₨' : 'AED',
              flag: ''
            }
          }),
          customConfig,
          swatConfig,
          currency: selectedCurrency,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `rate-card-${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "PDF Generated!",
          description: "Your rate card PDF has been downloaded.",
        })
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white px-4 sm:px-8 py-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <span>you gig</span>
                  <span className="text-purple-300">×</span>
                  <span>HUB71</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <span>POWERED BY</span>
                  <span className="text-yellow-400">⚡</span>
                  <span className="font-medium">Youpal Group</span>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-2 border border-gray-100 dark:border-slate-700 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <CurrencySelector
                      selectedCurrency={selectedCurrency}
                      onCurrencyChange={setSelectedCurrency}
                      className="w-full sm:w-[100px]"
                    />
                    
                    {selectedCurrency !== "AED" && !isRatesLoading && (
                      <div className="text-center sm:text-right text-xs mt-2 sm:mt-0">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          1 AED = {(1 / exchangeRates[selectedCurrency]).toFixed(4)} {selectedCurrency}
                        </div>
                        <div className="text-gray-500 dark:text-slate-400">
                          1 {selectedCurrency} = {exchangeRates[selectedCurrency].toFixed(4)} AED
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Live rates indicator */}
                  <div className="mt-1 flex items-center justify-end">
                    <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                      <div className={`w-2 h-2 rounded-full mr-1 ${isRatesLoading ? 'bg-yellow-400' : ratesError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span>Live exchange rates</span>
                      <button 
                        onClick={() => {
                          setIsRatesLoading(true);
                          setRatesError(null);
                          getExchangeRates()
                            .then(rates => {
                              const simpleRates: Record<string, number> = {};
                              Object.entries(rates).forEach(([code, currency]) => {
                                simpleRates[code] = currency.rate;
                              });
                              setExchangeRates(simpleRates);
                              setIsRatesLoading(false);
                            })
                            .catch(err => {
                              console.error("Error refreshing rates:", err);
                              setRatesError("Failed to refresh rates");
                              setIsRatesLoading(false);
                            });
                        }}
                        className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <Volume2 className="w-5 h-5 text-purple-200 hover:text-white cursor-pointer transition-colors" />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          {/* Main Content */}
          <div className="mt-8 space-y-8">
            {/* Rate Calculator */}
            <RateCalculator
              selectedCurrency={selectedCurrency}
              exchangeRates={exchangeRates}
              onRateChange={handleRateChange}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                onClick={() => setShowEmailForm(true)}
                className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-200 dark:shadow-slate-900 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <Mail className="w-5 h-5" />
                <span>Email Quote</span>
              </Button>
              <Button
                onClick={generatePDF}
                className="flex-1 h-14 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-lg shadow-purple-200 dark:shadow-slate-900 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </Button>
            </div>

            {/* Email Form Modal */}
            {showEmailForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 relative">
                  <button
                    onClick={() => setShowEmailForm(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Request Quote</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-slate-300">
                          Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={emailData.name}
                          onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                          required
                          className="rounded-xl h-12 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-slate-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          value={emailData.email}
                          onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                          required
                          className="rounded-xl h-12 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-700 dark:text-slate-300">
                        Company
                      </Label>
                      <Input
                        id="company"
                        placeholder="Your company"
                        value={emailData.company}
                        onChange={(e) => setEmailData({ ...emailData, company: e.target.value })}
                        className="rounded-xl h-12 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700 dark:text-slate-300">
                        Message (Optional)
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Any specific requirements or questions?"
                        value={emailData.message}
                        onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                        className="min-h-[100px] rounded-xl border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Quote"}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Footer - Separated youpal.io */}
            <div className="border-t border-gray-200 dark:border-slate-700 mt-12 pt-8 pb-12">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500 dark:text-slate-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <a
                      href="https://youpal.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      youpal.io
                    </a>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
