import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'beerList'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useBeerList() {
  const [list, setList] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }, [list])

  const add = useCallback((name, amount) => {
    setList((prev) => {
      const idx = prev.findIndex((e) => e.name === name)
      if (idx === -1) return [...prev, { name, amount }]
      const next = [...prev]
      next[idx] = { name, amount: next[idx].amount + amount }
      return next
    })
  }, [])

  const update = useCallback((oldName, newName, newAmount) => {
    setList((prev) => {
      const mapped = prev.map((e) =>
        e.name === oldName ? { name: newName, amount: newAmount } : e,
      )
      const seen = new Map()
      const result = []
      for (const e of mapped) {
        if (seen.has(e.name)) {
          seen.get(e.name).amount += e.amount
        } else {
          const copy = { ...e }
          seen.set(e.name, copy)
          result.push(copy)
        }
      }
      return result
    })
  }, [])

  const remove = useCallback((name) => {
    setList((prev) => prev.filter((e) => e.name !== name))
  }, [])

  const total = list.reduce((s, e) => s + e.amount, 0)

  return { list, add, update, remove, total }
}
