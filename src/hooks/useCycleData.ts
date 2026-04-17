import { useState, useCallback, useMemo } from 'react'
import type { PeriodEntry } from '../types'
import {
  getCycleConfig,
  setCycleConfig,
  clearCycleConfig,
  type CycleConfig,
} from '../utils/storage'
import { generatePeriods } from '../utils/cycleGenerator'

export function useCycleData() {
  const [config, setConfig] = useState<CycleConfig | null>(() => getCycleConfig())

  // Periods are derived from the cycle config — 8 cycles back + 3 predicted forward.
  const periods = useMemo<PeriodEntry[]>(() => {
    if (!config) return []
    return generatePeriods(config)
  }, [config])

  const updateCycleConfig = useCallback((newConfig: CycleConfig) => {
    setCycleConfig(newConfig)
    setConfig(newConfig)
  }, [])

  const clearConfig = useCallback(() => {
    clearCycleConfig()
    setConfig(null)
  }, [])

  const averageCycleLength = config?.cycleLength ?? 28

  return {
    periods,
    config,
    updateCycleConfig,
    clearConfig,
    averageCycleLength,
  }
}
