import React from 'react'

const colorMap = {
  ok: 'bg-ok/15 text-ok border-ok/30',
  gold: 'bg-gold/15 text-gold border-gold/30',
  muted: 'bg-white/10 text-muted border-white/15',
  danger: 'bg-danger/15 text-danger border-danger/30',
}

export default function Badge({ tone='muted', children, className='' }){
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${colorMap[tone] || colorMap.muted} ${className}`}>
      {children}
    </span>
  )
}
