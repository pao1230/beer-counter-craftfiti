import { useState } from 'react'
import { useBeerList } from '../hooks/useBeerList.js'

export default function ListPage() {
  const { list, update, remove, add, total, loading, busy, error, refresh } = useBeerList()
  const [editingName, setEditingName] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const startEdit = (entry) => {
    setEditingName(entry.name)
    setEditName(entry.name)
    setEditAmount(String(entry.amount))
  }

  const cancel = () => setEditingName(null)

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

      {error && <div className="flash error">{error}</div>}

      {!loading && list.length === 0 ? (
        <div className="empty">ยังไม่มีรายการ — กลับไปหน้า "เพิ่ม" เพื่อบันทึก</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th className="num">จำนวน</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((entry) => {
              const isEditing = editingName === entry.name
              return (
                <tr key={entry.name}>
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
                        <button className="small" onClick={() => add(entry.name, 1)} disabled={busy}>
                          +1
                        </button>
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
                <td>รวม</td>
                <td className="num">{total.toLocaleString()}</td>
                <td>ขวด</td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  )
}
