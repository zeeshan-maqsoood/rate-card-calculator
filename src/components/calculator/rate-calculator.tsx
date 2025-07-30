"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { useRateCalculator } from "@/hooks/calculator/use-rate-calculator"
import { RateCalculatorProps } from "@/types/calculator"

export function RateCalculator({ selectedCurrency, exchangeRates, onRateChange }: RateCalculatorProps) {
  const {
    // State
    activeTab,
    selectedRole,
    selectedWorkload,
    selectedDuration,
    selectedCustomRole,
    selectedRegion,
    selectedSeniority,
    availableRoles,
    availableRegions,
    availableSeniority,
    isLoading,
    isCalculating,
    swatTeamRate,
    customResourceRate,
    selectedRoleBaseRate,
    selectedCustomRoleBaseRate,
    
    // Constants
    workloadOptions,
    durationOptions,
    
    // Actions
    setActiveTab,
    setSelectedRole,
    setSelectedWorkload,
    setSelectedDuration,
    setSelectedCustomRole,
    setSelectedRegion,
    setSelectedSeniority,
    
    // Helpers
    formatCurrency
  } = useRateCalculator({
    selectedCurrency,
    exchangeRates,
    onRateChange
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-slate-400">Loading calculator data...</span>
      </div>
    )
  }

  const formattedCustomRate = formatCurrency(customResourceRate)
  const formattedSWATRate = formatCurrency(swatTeamRate)

  return (
    <div className="space-y-8">
      {/* Custom Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setActiveTab("swat-team")}
            className={`flex items-center gap-3 px-4 sm:px-8 py-4 rounded-2xl font-medium transition-all flex-1 justify-center ${
              activeTab === "swat-team"
                ? "bg-white dark:bg-slate-800 text-blue-600 shadow-lg border border-gray-200 dark:border-slate-600"
                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            <span className="text-blue-500">👥</span>
            <span>Shared Hub71 SWAT Team</span>
          </button>
          <button
            onClick={() => setActiveTab("custom-resources")}
            className={`flex items-center gap-3 px-4 sm:px-8 py-4 rounded-2xl font-medium transition-all flex-1 justify-center ${
              activeTab === "custom-resources"
                ? "bg-white dark:bg-slate-800 text-blue-600 shadow-lg border border-gray-200 dark:border-slate-600"
                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            <span className="text-gray-500 dark:text-slate-400">📋</span>
            <span>Custom Resources</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "swat-team" && (
        <Card className="w-full shadow-xl border-0 rounded-2xl bg-white dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-slate-100">SWAT Team Calculator</CardTitle>
            <p className="text-gray-600 dark:text-slate-400 font-medium">
              Pre-negotiated 20% discount. Base: Middle East - Advanced.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Role Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 text-gray-500 dark:text-slate-400">👤</div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Role</Label>
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 font-medium dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role} className="dark:text-slate-200 dark:focus:bg-slate-700">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRoleBaseRate > 0 && (
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Base rate: {formatCurrency(selectedRoleBaseRate)} per month
                  </div>
                )}
              </div>

              {/* Workload Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 text-gray-500 dark:text-slate-400">⚡</div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Workload</Label>
                </div>
                <div className="space-y-3">
                  {workloadOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={`w-full h-12 rounded-xl flex items-center justify-between px-4 font-medium border-2 transition-all ${
                        selectedWorkload === option.id
                          ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-md"
                          : "bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                      }`}
                      onClick={() => setSelectedWorkload(option.id)}
                    >
                      <span>{option.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm opacity-80">{option.display}</span>
                        {selectedWorkload === option.id && <Check className="w-4 h-4" />}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 text-gray-500 dark:text-slate-400">📅</div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Duration</Label>
                </div>
                <div className="space-y-3">
                  {durationOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={`w-full h-12 rounded-xl flex items-center justify-between px-4 font-medium border-2 transition-all ${
                        selectedDuration === option.id
                          ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-md"
                          : "bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                      }`}
                      onClick={() => setSelectedDuration(option.id)}
                    >
                      <span>{option.label}</span>
                      <div className="flex items-center gap-2">
                        {option.display && <span className="text-sm text-red-500 font-semibold">{option.display}</span>}
                        {selectedDuration === option.id && <Check className="w-4 h-4" />}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-600">
              <div className="text-right space-y-2">
                {isCalculating ? (
                  <div className="text-center py-4">
                    <span className="text-gray-600 dark:text-slate-400">Calculating...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Monthly rate</div>
                    <div className="text-3xl font-bold text-blue-600">{formattedSWATRate}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "custom-resources" && (
        <Card className="w-full shadow-xl border-0 rounded-2xl bg-white dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Custom Resource Calculator
            </CardTitle>
            <p className="text-gray-600 dark:text-slate-400 font-medium">
              Select region, role, and seniority for tailored pricing.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Region Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 text-gray-500 dark:text-slate-400">🌍</div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Region</Label>
                </div>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 font-medium dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region} className="dark:text-slate-200 dark:focus:bg-slate-700">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 text-gray-500 dark:text-slate-400">👤</div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Role</Label>
                </div>
                <Select value={selectedCustomRole} onValueChange={setSelectedCustomRole}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 font-medium dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role} className="dark:text-slate-200 dark:focus:bg-slate-700">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomRoleBaseRate > 0 && (
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Base rate: {formatCurrency(selectedCustomRoleBaseRate)} per month
                  </div>
                )}
              </div>

              {/* Seniority Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 text-gray-500 dark:text-slate-400">⭐</div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Seniority</Label>
                </div>
                <div className="space-y-3">
                  {availableSeniority.map((level) => (
                    <Button
                      key={level}
                      variant="outline"
                      className={`w-full h-12 rounded-xl flex items-center justify-between px-4 font-medium border-2 transition-all ${
                        selectedSeniority === level
                          ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-md"
                          : "bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                      }`}
                      onClick={() => setSelectedSeniority(level)}
                    >
                      <span className="capitalize">{level}</span>
                      <div className="flex items-center">
                        {selectedSeniority === level ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-slate-500" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-600">
              <div className="text-right space-y-2">
                {isCalculating ? (
                  <div className="text-center py-4">
                    <span className="text-gray-600 dark:text-slate-400">Calculating...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Monthly rate</div>
                    <div className="text-3xl font-bold text-blue-600">{formattedCustomRate}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
