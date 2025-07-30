import { useState, useEffect } from "react"
import { fetchRoles, fetchRegions, fetchSeniorityLevels, getBaseRateForRole, getRateData } from "@/lib/database/database"
import { formatCurrencyWithSymbol } from "@/lib/calculator/currency"
import { 
  RateCalculatorParams, 
  WorkloadOption, 
  DurationOption, 
  RateData, 
  UseRateCalculatorProps 
} from "@/types/calculator"

export function useRateCalculator({ selectedCurrency, exchangeRates, onRateChange }: UseRateCalculatorProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState("swat-team")
  
  // SWAT team state
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedWorkload, setSelectedWorkload] = useState("full-time")
  const [selectedDuration, setSelectedDuration] = useState("4-plus")
  
  // Custom resource state
  const [selectedCustomRole, setSelectedCustomRole] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedSeniority, setSelectedSeniority] = useState("")

  // Data state
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [availableRegions, setAvailableRegions] = useState<string[]>([])
  const [availableSeniority, setAvailableSeniority] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)

  // Rate state
  const [selectedRoleBaseRate, setSelectedRoleBaseRate] = useState<number>(0)
  const [selectedCustomRoleBaseRate, setSelectedCustomRoleBaseRate] = useState<number>(0)
  const [swatTeamRate, setSwatTeamRate] = useState<number>(0)
  const [customResourceRate, setCustomResourceRate] = useState<number>(0)

  // Constants
  const workloadOptions: WorkloadOption[] = [
    { id: "2-days", label: "2 days / week", percentage: 0.4, display: "40.0%" },
    { id: "3-days", label: "3 days / week", percentage: 0.6, display: "60.0%" },
    { id: "4-days", label: "4 days / week", percentage: 0.8, display: "80.0%" },
    { id: "full-time", label: "Full-time", percentage: 1.0, display: "100.0%" },
  ]

  const durationOptions: DurationOption[] = [
    { id: "1-month", label: "1 month", discount: 0, display: "" },
    { id: "2-months", label: "2 months", discount: 0.05, display: "-5.0%" },
    { id: "3-months", label: "3 months", discount: 0.1, display: "-10.0%" },
    { id: "4-plus", label: "4+ months", discount: 0.15, display: "-15.0%" },
  ]

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [roles, regions, seniority] = await Promise.all([
          fetchRoles(),
          fetchRegions(),
          fetchSeniorityLevels()
        ]);

        setAvailableRoles(roles)
        setAvailableRegions(regions)
        setAvailableSeniority(seniority)

        const defaultRole = roles.length > 0 ? roles[0] : "";
        const defaultRegion = regions.length > 0 ? regions[0] : "";
        const defaultSeniority = seniority.length > 0 ? seniority[0] : "";

        if (!selectedRole && defaultRole) {
          setSelectedRole(defaultRole)
        }
        if (!selectedCustomRole && defaultRole) {
          setSelectedCustomRole(defaultRole)
        }
        if (!selectedRegion && defaultRegion) {
          setSelectedRegion(defaultRegion)
        }
        if (!selectedSeniority && defaultSeniority) {
          setSelectedSeniority(defaultSeniority)
        }

        if (defaultRole) {
          const swatBaseRate = await getBaseRateForRole(defaultRole);
          setSelectedRoleBaseRate(swatBaseRate);
          
          const customRateData = await getRateData(defaultRole, defaultRegion, defaultSeniority);
          if (customRateData) {
            setSelectedCustomRoleBaseRate(customRateData.base_rate);
          }
        }

      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle SWAT role change
  useEffect(() => {
    const handleRoleChange = async (role: string) => {
      setIsCalculating(true);
      
      try {
        const baseRate = await getBaseRateForRole(role);
        
        // Ensure we have a valid base rate, use fallback if necessary
        const validBaseRate = baseRate > 0 ? baseRate : 1000; // Fallback to 1000 if no valid rate
        
        setSelectedRoleBaseRate(validBaseRate);
      } catch (error) {
        console.error("Error getting base rate:", error);
        // Use fallback rate if there's an error
        setSelectedRoleBaseRate(1000); // Fallback to 1000
      } finally {
        setIsCalculating(false);
      }
    };

    // Only call handleRoleChange when selectedRole changes, not when isLoading changes
    if (selectedRole) {
      handleRoleChange(selectedRole);
    }
  }, [selectedRole]);

  // Handle custom role/region/seniority change
  useEffect(() => {
    const updateCustomBaseRate = async () => {
      if (selectedCustomRole && selectedRegion && selectedSeniority) {
        try {
          const rateData = await getRateData(selectedCustomRole, selectedRegion, selectedSeniority);
          if (rateData) {
            setSelectedCustomRoleBaseRate(rateData.base_rate);
            
            calculateAndSetCustomRate(rateData);
          } else {
            setSelectedCustomRoleBaseRate(0);
            setCustomResourceRate(0);
          }
        } catch (error) {
          console.error("Error fetching rate data for custom role:", error);
        }
      }
    };
    
    if (!isLoading) {
      updateCustomBaseRate();
    }
  }, [selectedCustomRole, selectedRegion, selectedSeniority, isLoading, selectedCurrency, exchangeRates]);

  // Calculate SWAT team rate
  const calculateAndSetSWATRate = (baseRate: number) => {
    const seniorityMultiplier = 1.25; // SWAT teams are Advanced by default
    const workloadMultiplier = workloadOptions.find((w) => w.id === selectedWorkload)?.percentage || 1.0;
    const durationDiscount = durationOptions.find((d) => d.id === selectedDuration)?.discount || 0;
    const swatDiscount = 0.2; // 20% pre-negotiated discount

    // Ensure baseRate is a valid number
    const validBaseRate = isNaN(baseRate) || baseRate <= 0 ? 0 : baseRate;

    const rateAfterSeniority = validBaseRate * seniorityMultiplier;
    const rateAfterWorkload = rateAfterSeniority * workloadMultiplier;
    const rateAfterDuration = rateAfterWorkload * (1 - durationDiscount);
    const finalRate = rateAfterDuration * (1 - swatDiscount);
    const finalRateWithExchange = finalRate * (exchangeRates[selectedCurrency] || 1);

    setSwatTeamRate(finalRateWithExchange);
    
    if (onRateChange && activeTab === "swat-team") {
      const params: RateCalculatorParams = {
        role: selectedRole,
        workload: selectedWorkload,
        duration: selectedDuration,
        region: "Middle East", // SWAT teams are always Middle East
        seniority: "advanced", // SWAT teams are always Advanced
      };
      onRateChange(customResourceRate, finalRateWithExchange, params);
    }
  };

  // Calculate custom resource rate
  const calculateAndSetCustomRate = (rateData: RateData) => {
    const finalRate = rateData.base_rate * rateData.regional_multiplier * rateData.seniority_multiplier;
    const finalRateWithExchange = finalRate * (exchangeRates[selectedCurrency] || 1);

    setCustomResourceRate(finalRateWithExchange);
    
    if (onRateChange && activeTab === "custom-resources") {
      const params: RateCalculatorParams = {
        role: selectedCustomRole,
        region: selectedRegion,
        seniority: selectedSeniority,
        workload: "full-time", // Custom resources are always full-time
        duration: "1-month", // Default duration
      };
      onRateChange(finalRateWithExchange, swatTeamRate, params);
    }
  };

  // Update SWAT rate when dependencies change
  useEffect(() => {
    if (!isLoading && selectedRoleBaseRate > 0) {
      calculateAndSetSWATRate(selectedRoleBaseRate);
    }
  }, [selectedWorkload, selectedDuration, selectedCurrency, isLoading, selectedRoleBaseRate, exchangeRates]);

  // Update active tab selection
  useEffect(() => {
    if (!isLoading && onRateChange) {
      // Pass both rates to ensure both are updated in the parent component
      const rate = activeTab === "swat-team" ? swatTeamRate : customResourceRate;
      const params: RateCalculatorParams = activeTab === "swat-team" 
        ? {
            role: selectedRole,
            workload: selectedWorkload,
            duration: selectedDuration,
            region: "Middle East", // SWAT teams are always Middle East
            seniority: "advanced", // SWAT teams are always Advanced
          }
        : {
            role: selectedCustomRole,
            region: selectedRegion,
            seniority: selectedSeniority,
            workload: "full-time", // Custom resources are always full-time
            duration: "1-month", // Default duration
          };
      
      // Always pass both rates to ensure both states are updated in the parent
      onRateChange(customResourceRate, swatTeamRate, params);
    }
  }, [activeTab, isLoading, swatTeamRate, customResourceRate]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return formatCurrencyWithSymbol(amount, selectedCurrency)
  }

  return {
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
  }
}
