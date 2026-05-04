import { useState, useEffect, useCallback, useRef } from 'react'

const AUTO_REFRESH_MS = 30_000
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
  const busyRef = useRef(false)

  useEffect(() => () => { mounted.current = false }, [])

  const apply = useCallback((next) => {
    if (!mounted.current) return
    const sorted = [...next].sort((a, b) => b.amount - a.amount)
    setList(sorted)
    saveCache(sorted)
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

  useEffect(() => {
    const id = setInterval(() => {
      if (!busyRef.current) refresh()
    }, AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  const run = useCallback(async (op) => {
    busyRef.current = true
    setBusy(true)
    setError(null)
    try {
      const data = await op()
      apply(data)
    } catch (e) {
      if (mounted.current) setError(e.message)
      throw e
    } finally {
      if (mounted.current) {
        busyRef.current = false
        setBusy(false)
      }
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
