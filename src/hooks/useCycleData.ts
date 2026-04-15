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

  // Generate periods from config instead of reading them individually
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

  // Keep the old interface working for backward compatibility.
  // Generated periods are derived from config, so individual add/remove/update
  // are no-ops — the setup page manages config as a whole.
  const addPeriod = useCallback((_entry: Omit<PeriodEntry, 'id'>): PeriodEntry => {
    return { id: 'noop', startDate: '', endDate: null }
  }, [])

  const removePeriod = useCallback((_id: string): void => {}, [])

  const updatePeriod = useCallback(
    (_id: string, _updates: Partial<Omit<PeriodEntry, 'id'>>): void => {},
    []
  )

  const averageCycleLength = config?.cycleLength ?? 28

  return {
    periods,
    config,
    updateCycleConfig,
    clearConfig,
    addPeriod,
    removePeriod,
    updatePeriod,
    averageCycleLength,
  }
}
