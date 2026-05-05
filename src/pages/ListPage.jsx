import { useState } from 'react'
import { useBeerList } from '../hooks/useBeerList.js'

const RANK_LABELS = ['👑 ราชันขวด', '🥃 เซียนแก้ว', '🔥 ดาวเมา']
const getRankLabel = (rank) => RANK_LABELS[rank - 1] ?? '🐣 ลูกกระจ้อก'
const getRankClass = (rank) => `rank rank-${Math.min(rank, 4)}`

export default function ListPage() {
  const { list, update, remove, add, loading, busy, error, refresh } = useBeerList()
  const [editingName, setEditingName] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [floats, setFloats] = useState({})
  const [search, setSearch] = useState('')

  const rankMap = Object.fromEntries(list.map((e, i) => [e.name, i + 1]))

  const filtered = search.trim()
    ? list.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : list

  const filteredTotal = filtered.reduce((s, e) => s + (e.amount || 0), 0)

  const startEdit = (entry) => {
    setEditingName(entry.name)
    setEditName(entry.name)
    setEditAmount(String(entry.amount))
  }

  const cancel = () => setEditingName(null)

  const handleQuickAdd = (name) => {
    add(name, 1)
    const id = Date.now() + Math.random()
    setFloats(prev => ({ ...prev, [name]: [...(prev[name] || []), id] }))
    setTimeout(() => {
      setFloats(prev => ({ ...prev, [name]: (prev[name] || []).filter(i => i !== id) }))
    }, 800)
  }

  const save = async (originalName) => {
    const trimmed = editName.trim()
    const n = parseInt(editAmount, 10)
    if (!trimmed || !n || n < 1) return
    try {
      await update(originalName, trimmed, n)
      setEditingName(null)
    } catch {
      // error shown below
    }
  }

  const confirmRemove = async (name) => {
    if (!window.confirm(`ลบ ${name} ออกจากรายการ?`)) return
    try {
      await remove(name)
    } catch {
      // error shown below
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="muted">
          {loading ? 'กำลังโหลด…' : `${list.length} คน`}
        </span>
        <button className="secondary small" onClick={refresh} disabled={loading || busy}>
          รีเฟรช
        </button>
      </div>

      <input
        className="search-input"
        type="search"
        placeholder="ค้นหาชื่อ…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {error && <div className="flash error">{error}</div>}

      {!loading && list.length === 0 ? (
        <div className="empty">ยังไม่มีรายการ — กลับไปหน้า "เพิ่ม" เพื่อบันทึก</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="rank-col">ตำแหน่ง</th>
              <th>ชื่อ</th>
              <th className="num">จำนวน</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="empty">ไม่พบชื่อ "{search}"</td></tr>
            )}
            {filtered.map((entry) => {
              const isEditing = editingName === entry.name
              const rank = rankMap[entry.name]
              return (
                <tr key={entry.name}>
                  <td className="rank-col">
                    <span className={getRankClass(rank)}>{getRankLabel(rank)}</span>
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      entry.name
                    )}
                  </td>
                  <td className="num">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    ) : (
                      entry.amount.toLocaleString()
                    )}
                  </td>
                  <td className="row-actions">
                    {isEditing ? (
                      <>
                        <button onClick={() => save(entry.name)} disabled={busy}>
                          บันทึก
                        </button>
                        <button className="secondary" onClick={cancel} disabled={busy}>
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="float-container">
                          {(floats[entry.name] || []).map(id => (
                            <span key={id} className="float-emoji">🍺</span>
                          ))}
                          <button className="small" onClick={() => handleQuickAdd(entry.name)} disabled={busy}>
                            +1
                          </button>
                        </span>
                        <button className="secondary" onClick={() => startEdit(entry)} disabled={busy}>
                          แก้ไข
                        </button>
                        <button className="danger" onClick={() => confirmRemove(entry.name)} disabled={busy}>
                          ลบ
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          {list.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={2}>รวม{search.trim() ? ' (กรอง)' : ''}</td>
                <td className="num">{filteredTotal.toLocaleString()}</td>
                <td>ขวด</td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  )
}
