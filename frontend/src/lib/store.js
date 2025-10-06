// Simple localStorage-based store with per-user namespacing

export function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.id || null
  } catch {
    return null
  }
}

function nsKey(baseKey, userId) {
  return userId ? `${baseKey}__${userId}` : baseKey
}

export function loadList(baseKey, defaultValue = []) {
  const userId = getCurrentUserId()
  const key = nsKey(baseKey, userId)
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveList(baseKey, list) {
  const userId = getCurrentUserId()
  const key = nsKey(baseKey, userId)
  localStorage.setItem(key, JSON.stringify(list))
}

export function upsertItem(baseKey, item, idField = 'id') {
  const list = loadList(baseKey)
  const idx = list.findIndex((x) => x[idField] === item[idField])
  if (idx >= 0) list[idx] = { ...list[idx], ...item }
  else list.push(item)
  saveList(baseKey, list)
  return list
}

export function deleteItem(baseKey, id, idField = 'id') {
  const list = loadList(baseKey)
  const next = list.filter((x) => x[idField] !== id)
  saveList(baseKey, next)
  return next
}


