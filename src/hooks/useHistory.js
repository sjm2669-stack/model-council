import { useState, useCallback } from 'react'

const STORAGE_KEY = 'model-council-history'
const MAX_ENTRIES = 50

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useHistory() {
  const [history, setHistory] = useState(read)

  const saveSession = useCallback((session) => {
    const entry = { id: crypto.randomUUID(), timestamp: Date.now(), ...session }
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    return entry
  }, [])

  const deleteSession = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, saveSession, deleteSession, clearHistory }
}
