import { useState, useEffect, useCallback, useRef } from 'react'
import { sheetsApi } from '../api/sheets.js'

const CACHE_KEY = 'beerListCache'

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list))
  } catch {
    // quota / private mode — ignore
  }
}

export function useBeerList() {
  const [list, setList] = useState(loadCache)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const mounted = useRef(true)

  useEffect(() => () => { mounted.current = false }, [])

  const apply = useCallback((next) => {
    if (!mounted.current) return
    setList(next)
    saveCache(next)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await sheetsApi.list()
      apply(data)
    } catch (e) {
      if (mounted.current) setError(e.message)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [apply])

  useEffect(() => {
    refresh()
  }, [refresh])

  const run = useCallback(async (op) => {
    setBusy(true)
    setError(null)
    try {
      const data = await op()
      apply(data)
    } catch (e) {
      if (mounted.current) setError(e.message)
      throw e
    } finally {
      if (mounted.current) setBusy(false)
    }
  }, [apply])

  const add = useCallback(
    (name, amount) => run(() => sheetsApi.add(name, amount)),
    [run],
  )
  const update = useCallback(
    (oldName, newName, newAmount) => run(() => sheetsApi.update(oldName, newName, newAmount)),
    [run],
  )
  const remove = useCallback(
    (name) => run(() => sheetsApi.remove(name)),
    [run],
  )

  const total = list.reduce((s, e) => s + (e.amount || 0), 0)

  return { list, total, loading, busy, error, refresh, add, update, remove }
}
