import { useState, useEffect } from 'react'

export function useSessionState(key, initialValue = '') {
  const [value, setValue] = useState(() => {
    const stored = sessionStorage.getItem(key)
    return stored !== null ? stored : initialValue
  })

  useEffect(() => {
    if (value === '' || value == null) {
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, value)
    }
  }, [key, value])

  return [value, setValue]
}
