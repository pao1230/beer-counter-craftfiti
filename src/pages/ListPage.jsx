import { useState } from 'react'
import { useBeerList } from '../hooks/useBeerList.js'

export default function ListPage() {
  const { list, update, remove, total } = useBeerList()
  const [editingName, setEditingName] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const startEdit = (entry) => {
    setEditingName(entry.name)
    setEditName(entry.name)
    setEditAmount(String(entry.amount))
  }

  const cancel = () => setEditingName(null)

  const save = (originalName) => {
    const trimmed = editName.trim()
    const n = parseInt(editAmount, 10)
    if (!trimmed || !n || n < 1) return
    update(originalName, trimmed, n)
    setEditingName(null)
  }

  const confirmRemove = (name) => {
    if (window.confirm(`ลบ ${name} ออกจากรายการ?`)) remove(name)
  }

  if (list.length === 0) {
    return <div className="card empty">ยังไม่มีรายการ — กลับไปหน้า "เพิ่ม" เพื่อบันทึก</div>
  }

  return (
    <div className="card">
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
                    entry.amount
                  )}
                </td>
                <td className="row-actions">
                  {isEditing ? (
                    <>
                      <button onClick={() => save(entry.name)}>บันทึก</button>
                      <button className="secondary" onClick={cancel}>ยกเลิก</button>
                    </>
                  ) : (
                    <>
                      <button className="secondary" onClick={() => startEdit(entry)}>แก้ไข</button>
                      <button className="danger" onClick={() => confirmRemove(entry.name)}>ลบ</button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>รวม</td>
            <td className="num">{total}</td>
            <td>แก้ว</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
