import { useState, useCallback } from 'react'
import type { PeriodEntry } from '../types'
import {
  getPeriods,
  addPeriod as storageAddPeriod,
  removePeriod as storageRemovePeriod,
  updatePeriod as storageUpdatePeriod,
} from '../utils/storage'
import { getAverageCycleLength } from '../utils/cycleEngine'

export function useCycleData() {
  const [periods, setPeriods] = useState<PeriodEntry[]>(() => getPeriods())

  const addPeriod = useCallback(
    (entry: Omit<PeriodEntry, 'id'>): PeriodEntry => {
      const newEntry = storageAddPeriod(entry)
      setPeriods(getPeriods())
      return newEntry
    },
    []
  )

  const removePeriod = useCallback((id: string): void => {
    storageRemovePeriod(id)
    setPeriods(getPeriods())
  }, [])

  const updatePeriod = useCallback(
    (id: string, updates: Partial<Omit<PeriodEntry, 'id'>>): void => {
      storageUpdatePeriod(id, updates)
      setPeriods(getPeriods())
    },
    []
  )

  const averageCycleLength = getAverageCycleLength(periods)

  return {
    periods,
    addPeriod,
    removePeriod,
    updatePeriod,
    averageCycleLength,
  }
}
