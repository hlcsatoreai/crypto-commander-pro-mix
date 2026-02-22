import React from 'react'
import Badge from './Badge.jsx'
import { fmtEUR, fmtNum } from '../lib/format.js'

export default function Row({ item, eurPerUsdt, onSelect, active }){
  const lastEUR = eurPerUsdt ? item.last * eurPerUsdt : null
  const tone = item.score >= 80 ? 'ok' : item.score >= 65 ? 'gold' : item.score >= 50 ? 'muted' : 'danger'
  return (
    <button
      onClick={() => onSelect(item.symbol)}
      className={`w-full text-left rounded-xl border border-white/10 hover:border-white/20 bg-panel2/60 hover:bg-panel2/80 transition p-3 ${active ? 'ring-1 ring-gold/40 border-gold/30' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-bold">{item.symbol}</div>
            <Badge tone={tone}>AI {item.score}</Badge>
          </div>
          <div className="mt-1 text-xs text-muted">
            Prezzo: <span className="text-white/90">{fmtEUR(lastEUR, lastEUR < 1 ? 6 : 2)}</span>
            <span className="mx-2">•</span>
            24h: <span className={item.change24 >= 0 ? 'text-ok' : 'text-danger'}>{fmtNum(item.change24,2)}%</span>
            <span className="mx-2">•</span>
            Vol: <span className="text-white/80">{fmtNum(item.quoteVolume/1e6,2)}M</span>
          </div>
        </div>
        <div className="text-xs text-muted whitespace-nowrap">{item.verdict}</div>
      </div>
    </button>
  )
}
