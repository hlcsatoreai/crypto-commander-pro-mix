export function ema(values, period){
  if (!values || values.length === 0) return null
  const k = 2 / (period + 1)
  let e = values[0]
  for (let i=1;i<values.length;i++) e = values[i]*k + e*(1-k)
  return e
}
export function sma(values, period){
  if (!values || values.length < period) return null
  const slice = values.slice(values.length-period)
  return slice.reduce((a,b)=>a+b,0)/period
}
export function stddev(values){
  const m = values.reduce((a,b)=>a+b,0)/values.length
  const v = values.reduce((a,b)=>a+(b-m)*(b-m),0)/values.length
  return Math.sqrt(v)
}
export function bollinger(values, period=20, mult=2){
  if (!values || values.length < period) return null
  const slice = values.slice(values.length-period)
  const mid = sma(values, period)
  const sd = stddev(slice)
  return { mid, upper: mid + mult*sd, lower: mid - mult*sd }
}
export function rsi(values, period=14){
  if (!values || values.length < period+1) return null
  let gains=0, losses=0
  for (let i=1;i<=period;i++){
    const diff = values[i]-values[i-1]
    if (diff>=0) gains += diff
    else losses -= diff
  }
  let avgGain = gains/period
  let avgLoss = losses/period
  for (let i=period+1;i<values.length;i++){
    const diff = values[i]-values[i-1]
    const gain = diff>0 ? diff : 0
    const loss = diff<0 ? -diff : 0
    avgGain = (avgGain*(period-1) + gain)/period
    avgLoss = (avgLoss*(period-1) + loss)/period
  }
  if (avgLoss === 0) return 100
  const rs = avgGain/avgLoss
  return 100 - (100/(1+rs))
}
export function volSpike(volumes, lookback=20){
  if (!volumes || volumes.length < lookback) return null
  const slice = volumes.slice(volumes.length-lookback)
  const avg = slice.reduce((a,b)=>a+b,0)/slice.length
  const cur = volumes[volumes.length-1]
  return { cur, avg, ratio: avg>0 ? cur/avg : null }
}
