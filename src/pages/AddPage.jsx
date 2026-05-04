import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionState } from '../hooks/useSessionState.js'
import { useBeerList } from '../hooks/useBeerList.js'

export default function AddPage() {
  const [name, setName] = useSessionState('beerUserName', '')
  const [amount, setAmount] = useState('')
  const [flash, setFlash] = useState('')
  const { add, busy, error } = useBeerList()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const n = parseInt(amount, 10)
    if (!trimmedName || !n || n < 1) return
    try {
      await add(trimmedName, n)
      setAmount('')
      setFlash(`เพิ่ม ${n} แก้ว ให้ ${trimmedName} แล้ว`)
      setTimeout(() => setFlash(''), 1800)
    } catch {
      // error shown via `error` from hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <label>
        ชื่อ
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ใส่ชื่อ"
          autoFocus
          required
        />
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
