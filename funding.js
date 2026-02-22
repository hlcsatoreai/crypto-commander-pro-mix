export async function json(res, status=200){
  return { statusCode: status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, body: JSON.stringify(res) }
}
export async function fetchJson(url){
  const r = await fetch(url, { headers: { 'user-agent': 'crypto-commander-pro-mix/1.0' } })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return await r.json()
}
export function safeSymbol(q){
  const s = String(q || '').toUpperCase().trim()
  if (!/^[A-Z0-9]{3,20}$/.test(s)) return null
  return s
}
