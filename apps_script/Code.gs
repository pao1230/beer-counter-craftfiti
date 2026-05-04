/**
 * Beer Counter — Google Apps Script Web App
 *
 * Deploy:
 * 1. เปิด Google Sheet → Extensions → Apps Script
 * 2. ลบโค้ดเดิม → paste ไฟล์นี้ทั้งหมด → Save
 * 3. Deploy → New deployment → Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Copy "Web app URL" → ใส่ใน .env เป็น VITE_SHEETS_API_URL
 *
 * Sheet layout (row 1 = headers):
 *   A: Name  | B: Amount  | C: UpdateTime
 */

function doGet(e) {
  return safe(() => ({ list: readAll() }))
}

function doPost(e) {
  return safe(() => {
    const body = JSON.parse(e.postData.contents || '{}')
    switch (body.action) {
      case 'add':
        addOrIncrement(String(body.name).trim(), Number(body.amount))
        break
      case 'update':
        updateRow(String(body.oldName), String(body.newName).trim(), Number(body.newAmount))
        break
      case 'delete':
        deleteRow(String(body.name))
        break
      default:
        throw new Error('Unknown action: ' + body.action)
    }
    return { list: readAll() }
  })
}

function sheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
}

function readAll() {
  const s = sheet()
  const last = s.getLastRow()
  if (last < 2) return []
  return s.getRange(2, 1, last - 1, 3).getValues()
    .filter(r => String(r[0]).trim() !== '')
    .map(([name, amount, updateTime]) => ({
      name: String(name),
      amount: Number(amount) || 0,
      updateTime: updateTime instanceof Date ? updateTime.toISOString() : null,
    }))
}

function findRow(name) {
  const s = sheet()
  const last = s.getLastRow()
  if (last < 2) return -1
  const names = s.getRange(2, 1, last - 1, 1).getValues()
  for (let i = 0; i < names.length; i++) {
    if (String(names[i][0]) === name) return i + 2
  }
  return -1
}

function addOrIncrement(name, amount) {
  if (!name || !amount || amount < 1) throw new Error('Invalid input')
  const s = sheet()
  const row = findRow(name)
  const now = new Date()
  if (row === -1) {
    s.appendRow([name, amount, now])
  } else {
    const current = Number(s.getRange(row, 2).getValue()) || 0
    s.getRange(row, 2, 1, 2).setValues([[current + amount, now]])
  }
}

function updateRow(oldName, newName, newAmount) {
  if (!newName || !newAmount || newAmount < 1) throw new Error('Invalid input')
  const s = sheet()
  const row = findRow(oldName)
  if (row === -1) throw new Error('Not found: ' + oldName)
  const now = new Date()

  if (oldName !== newName) {
    const target = findRow(newName)
    if (target !== -1) {
      const merged = (Number(s.getRange(target, 2).getValue()) || 0) + newAmount
      s.getRange(target, 2, 1, 2).setValues([[merged, now]])
      s.deleteRow(row)
      return
    }
  }

  s.getRange(row, 1, 1, 3).setValues([[newName, newAmount, now]])
}

function deleteRow(name) {
  const s = sheet()
  const row = findRow(name)
  if (row !== -1) s.deleteRow(row)
}

function safe(fn) {
  try {
    const result = fn()
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, ...result }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
