import { useState, useCallback } from 'react'
import type { GameEntry } from '../types'
import {
  getGames,
  addGame as storageAddGame,
  removeGame as storageRemoveGame,
} from '../utils/storage'

export function useGameData() {
  const [games, setGames] = useState<GameEntry[]>(() => getGames())

  const addGame = useCallback(
    (entry: Omit<GameEntry, 'id'>): GameEntry => {
      const newEntry = storageAddGame(entry)
      setGames(getGames())
      return newEntry
    },
    []
  )

  const removeGame = useCallback((id: string): void => {
    storageRemoveGame(id)
    setGames(getGames())
  }, [])

  return {
    games,
    addGame,
    removeGame,
  }
}
