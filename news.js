import { json, fetchJson } from './_util.js'
export const handler = async () => {
  try{
    const data = await fetchJson('https://api.binance.com/api/v3/ticker/price?symbol=EURUSDT')
    const eurusdt = Number(data.price) // 1 EUR in USDT
    const eurPerUsdt = eurusdt ? (1 / eurusdt) : null
    return json({ eurPerUsdt, source: 'binance:EURUSDT' })
  }catch(e){
    return json({ eurPerUsdt: null, error: String(e?.message || e) }, 200)
  }
}
