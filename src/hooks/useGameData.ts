import { useState, useCallback } from 'react'
import type { GameEntry } from '../types'
import {
  getGames,
  addGame as storageAddGame,
  removeGame as storageRemoveGame,
  setGames as storageSetGames,
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

  // Bulk-set games (used when Riot match history is fetched)
  const setAllGames = useCallback((newGames: GameEntry[]) => {
    storageSetGames(newGames)
    setGames(newGames)
  }, [])

  return {
    games,
    addGame,
    removeGame,
    setAllGames,
  }
}
