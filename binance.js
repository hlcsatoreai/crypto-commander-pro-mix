import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Flame, RefreshCw, Search, TrendingUp, ShieldAlert, Newspaper, Waves } from 'lucide-react'
import Badge from './components/Badge.jsx'
import Row from './components/Row.jsx'
import { fetchKlines, fetchOrderBook, fetchTopUSDTByVolume, computeImbalance, wsTickerStream } from './lib/binance.js'
import { getEURPerUSDT, getFunding, getNewsScore } from './lib/proxy.js'
import { computeScore, verdictFromScore, planFromPriceEUR } from './lib/scoring.js'
import { fmtEUR, fmtNum } from './lib/format.js'

export default function App(){
  const [eurPerUsdt, setEurPerUsdt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const wsRef = useRef(null)

  const filtered = useMemo(() => {
    const s = q.trim().toUpperCase()
    if (!s) return items
    return items.filter(x => x.symbol.includes(s))
  }, [items, q])

  async function refreshAll(){
    setLoading(true)
    try{
      const eur = await getEURPerUSDT()
      setEurPerUsdt(eur)

      const top = await fetchTopUSDTByVolume(30)

      const enriched = []
      for (const t of top){
        try{
          const [{ closes, volumes }, ob, funding, newsScore] = await Promise.all([
            fetchKlines(t.symbol, '5m', 120),
            fetchOrderBook(t.symbol, 20),
            getFunding(t.symbol).catch(()=>null),
            getNewsScore(t.symbol).catch(()=>null),
          ])
          const imb = computeImbalance(ob)
          const cs = computeScore({ closes, volumes, last: t.last, funding, obImbalance: imb, newsScore })
          const v = verdictFromScore(cs.score)
          enriched.push({ ...t, score: cs.score, verdict: v.tag, tone: v.color })
        } catch {
          enriched.push({ ...t, score: 0, verdict: 'ATTENDI', tone: 'muted' })
        }
      }
      enriched.sort((a,b)=>b.score-a.score)
      setItems(enriched)
      if (!selected && enriched.length) setSelected(enriched[0].symbol)
    } finally {
      setLoading(false)
    }
  }

  async function loadDetail(symbol){
    if (!symbol) return
    setSelected(symbol)
    const it = items.find(x=>x.symbol===symbol)
    try{
      const [k5, ob, funding, newsScore] = await Promise.all([
        fetchKlines(symbol, '5m', 200),
        fetchOrderBook(symbol, 20),
        getFunding(symbol).catch(()=>null),
        getNewsScore(symbol).catch(()=>null),
      ])
      const imb = computeImbalance(ob)
      const last = it?.last ?? (k5.closes?.[k5.closes.length-1] ?? null)
      const cs = computeScore({ closes: k5.closes, volumes: k5.volumes, last, funding, obImbalance: imb, newsScore })
      const v = verdictFromScore(cs.score)
      const eur = eurPerUsdt ? last * eurPerUsdt : null
      const plan = eur ? planFromPriceEUR(eur) : null
      setDetail({ symbol, last, lastEUR: eur, score: cs.score, verdict: v, reasons: cs.reasons, imb, funding, newsScore, plan })
    } catch {
      setDetail(null)
    }
  }

  useEffect(() => { refreshAll() }, [])

  useEffect(() => {
    if (!items.length) return
    try{ wsRef.current?.close?.() } catch {}
    const symbols = items.map(x=>x.symbol).slice(0,30)
    const ws = wsTickerStream(symbols, (d) => {
      const sym = d.s
      const last = Number(d.c)
      setItems(prev => prev.map(x => x.symbol===sym ? ({...x, last }) : x))
    })
    wsRef.current = ws
    return () => { try{ ws.close() } catch {} }
  }, [items.length])

  useEffect(() => { if (selected) loadDetail(selected) }, [selected, eurPerUsdt])

  const topHot = useMemo(() => items.filter(x=>x.score>=65).slice(0,10), [items])

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gold/15 border border-gold/25 grid place-items-center shadow-soft">
              <Flame className="h-5 w-5 text-gold" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-wide">CRYPTO-COMMANDER PRO</div>
              <div className="text-xs text-muted">Mix serio: WebSocket client + Netlify Functions (EUR/Funding/News). Prezzi in EUR.</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2 rounded-2xl bg-panel/70 border border-white/10 px-3 py-2">
              <Search className="h-4 w-4 text-muted" />
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cerca (SOL, XRP, PEPE...)"
                className="bg-transparent outline-none text-sm w-64 max-w-full" />
            </div>
            <button onClick={refreshAll}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold/15 border border-gold/25 hover:bg-gold/20 px-4 py-2 font-semibold">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Aggiorna
            </button>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-panel/60 shadow-soft overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Badge tone="muted"><Activity className="h-3.5 w-3.5"/> Scanner</Badge>
                <div className="text-sm text-muted">Top 30 USDT per volume. Seleziona una coin per piano d'azione.</div>
              </div>
              <Badge tone="muted">EUR/USDT: {eurPerUsdt ? eurPerUsdt.toFixed(4) : '—'}</Badge>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-auto">
              {filtered.map(it => (
                <Row key={it.symbol} item={it} eurPerUsdt={eurPerUsdt} active={it.symbol===selected} onSelect={setSelected} />
              ))}
              {!filtered.length && <div className="text-sm text-muted">Nessun risultato.</div>}
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-panel/60 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="font-bold">Piano d'Azione</div>
              <Badge tone={detail?.verdict?.color || 'muted'}>{detail?.verdict?.tag || '—'}</Badge>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3">
                <div className="text-xs text-muted">Coin</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-lg font-extrabold">{detail?.symbol || '—'}</div>
                  <Badge tone="muted">AI {detail?.score ?? '—'}/100</Badge>
                </div>
                <div className="mt-2 text-sm text-muted">
                  Prezzo: <span className="text-white/90">{fmtEUR(detail?.lastEUR, (detail?.lastEUR ?? 0) < 1 ? 6 : 2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3">
                  <div className="text-xs text-muted flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5"/> Entry</div>
                  <div className="mt-1 font-bold">{detail?.plan ? fmtEUR(detail.plan.entryEUR, (detail.plan.entryEUR < 1 ? 6 : 2)) : '—'}</div>
                </div>
                <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3">
                  <div className="text-xs text-muted flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5"/> Stop</div>
                  <div className="mt-1 font-bold text-danger">{detail?.plan ? fmtEUR(detail.plan.sl, (detail.plan.sl < 1 ? 6 : 2)) : '—'}</div>
                </div>
                <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3">
                  <div className="text-xs text-muted">TP1 (+10%)</div>
                  <div className="mt-1 font-bold text-ok">{detail?.plan ? fmtEUR(detail.plan.tp1, (detail.plan.tp1 < 1 ? 6 : 2)) : '—'}</div>
                </div>
                <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3">
                  <div className="text-xs text-muted">TP2 (+25%)</div>
                  <div className="mt-1 font-bold text-ok">{detail?.plan ? fmtEUR(detail.plan.tp2, (detail.plan.tp2 < 1 ? 6 : 2)) : '—'}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3 space-y-2">
                <div className="text-xs text-muted">Moduli PRO</div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="muted"><Waves className="h-3.5 w-3.5"/> OrderBook {detail?.imb !== null && detail?.imb !== undefined ? `${(detail.imb*100).toFixed(0)}% bid` : '—'}</Badge>
                  <Badge tone="muted">Funding {detail?.funding !== null && detail?.funding !== undefined ? `${detail.funding.toFixed(3)}%` : '—'}</Badge>
                  <Badge tone="muted"><Newspaper className="h-3.5 w-3.5"/> News {detail?.newsScore ?? '—'}/100</Badge>
                </div>
              </div>

              <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3">
                <div className="text-xs text-muted">Spiegazione (chiara)</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {(detail?.reasons || []).slice(0,6).map((r,i)=>(<li key={i} className="text-white/85">• {r}</li>))}
                  {!detail?.reasons?.length && <li className="text-muted">Seleziona una coin o premi Aggiorna.</li>}
                </ul>
                <div className="mt-3 text-xs text-muted">
                  Entra solo su <b>ORA COMPRI</b> o <b>PREPARATI</b> + rispetta Stop. Non è consiglio finanziario.
                </div>
              </div>

              <div className="rounded-2xl bg-panel2/60 border border-white/10 p-3">
                <div className="text-xs text-muted">HOT Signals</div>
                <div className="mt-2 space-y-2">
                  {topHot.length ? topHot.map(h => (
                    <button key={h.symbol} onClick={()=>setSelected(h.symbol)}
                      className="w-full text-left flex items-center justify-between rounded-xl border border-white/10 hover:border-white/20 px-3 py-2">
                      <div className="font-semibold">{h.symbol}</div>
                      <div className="flex items-center gap-2">
                        <Badge tone={h.score>=80 ? 'ok' : 'gold'}>AI {h.score}</Badge>
                        <span className="text-xs text-muted">{h.verdict}</span>
                      </div>
                    </button>
                  )) : <div className="text-xs text-muted">Nessun segnale caldo ora.</div>}
                </div>
              </div>

            </div>
          </aside>
        </div>

        <footer className="mt-6 text-xs text-muted">
          <div className="rounded-2xl border border-white/10 bg-panel/40 p-3">
            Prezzi Binance USDT convertiti in EUR via EUR/USDT. Funding/news via Netlify Functions (proxy). Orderbook snapshot REST (20 livelli).
            Tool per studio: non è consiglio finanziario.
          </div>
        </footer>
      </div>
    </div>
  )
}
