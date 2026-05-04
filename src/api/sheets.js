const API_URL = import.meta.env.VITE_SHEETS_API_URL
export const MODE = API_URL ? 'remote' : 'local'

const LOCAL_KEY = 'beerListLocal'

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocal(list) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  return list
}

const local = {
  list: () => loadLocal(),
  add: (name, amount) => {
    const list = loadLocal()
    const idx = list.findIndex((e) => e.name === name)
    const now = new Date().toISOString()
    if (idx === -1) {
      list.push({ name, amount, updateTime: now })
    } else {
      list[idx] = { name, amount: list[idx].amount + amount, updateTime: now }
    }
    return saveLocal(list)
  },
  update: (oldName, newName, newAmount) => {
    const list = loadLocal()
    const idx = list.findIndex((e) => e.name === oldName)
    if (idx === -1) throw new Error('Not found: ' + oldName)
    const now = new Date().toISOString()

    if (oldName !== newName) {
      const target = list.findIndex((e) => e.name === newName)
      if (target !== -1) {
        list[target] = {
          name: newName,
          amount: list[target].amount + newAmount,
          updateTime: now,
        }
        list.splice(idx, 1)
        return saveLocal(list)
      }
    }

    list[idx] = { name: newName, amount: newAmount, updateTime: now }
    return saveLocal(list)
  },
  remove: (name) => saveLocal(loadLocal().filter((e) => e.name !== name)),
}

async function request(method, body) {
  const init = { method, redirect: 'follow' }
  if (body) {
    init.headers = { 'Content-Type': 'text/plain;charset=utf-8' }
    init.body = JSON.stringify(body)
  }
  const res = await fetch(API_URL, init)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Unknown error')
  return data.list
}

const remote = {
  list: () => request('GET'),
  add: (name, amount) => request('POST', { action: 'add', name, amount }),
  update: (oldName, newName, newAmount) =>
    request('POST', { action: 'update', oldName, newName, newAmount }),
  remove: (name) => request('POST', { action: 'delete', name }),
}

const backend = MODE === 'remote' ? remote : local

export const sheetsApi = {
  list: async () => backend.list(),
  add: async (name, amount) => backend.add(name, amount),
  update: async (oldName, newName, newAmount) =>
    backend.update(oldName, newName, newAmount),
  remove: async (name) => backend.remove(name),
}
