import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionState } from '../hooks/useSessionState.js'
import { useBeerList } from '../hooks/useBeerList.js'

export default function AddPage() {
  const [name, setName] = useSessionState('beerUserName', '')
  const [amount, setAmount] = useState('')
  const [flash, setFlash] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { add, busy, error, list } = useBeerList()
  const navigate = useNavigate()

  const suggestions = name.trim()
    ? list.filter(e => e.name.toLowerCase().startsWith(name.toLowerCase().trim()))
    : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const n = parseInt(amount, 10)
    if (!trimmedName || !n || n < 1) return
    try {
      await add(trimmedName, n)
      setAmount('')
      setFlash(`เพิ่ม ${n} ขวด ให้ ${trimmedName} แล้ว`)
      setTimeout(() => setFlash(''), 1800)
    } catch {
      // error shown via `error` from hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <label>
        ชื่อ
        <div className="autocomplete-wrapper">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="ใส่ชื่อ"
            autoFocus
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map(e => (
                <li key={e.name} onMouseDown={() => { setName(e.name); setShowSuggestions(false) }}>
                  {e.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </label>
      <label>
        จำนวนเบียร์
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          placeholder="0"
          required
        />
      </label>
      <div className="actions">
        <button type="submit" disabled={busy}>
          {busy ? 'กำลังบันทึก…' : 'เพิ่ม'}
        </button>
        <button type="button" className="secondary" onClick={() => navigate('/list')}>
          ดูรายการ
        </button>
      </div>
      {flash && <div className="flash">{flash}</div>}
      {error && <div className="flash error">บันทึกไม่สำเร็จ: {error}</div>}
    </form>
  )
}
