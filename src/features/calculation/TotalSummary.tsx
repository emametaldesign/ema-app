import { Building2, Calculator, Layers3, Ruler } from 'lucide-react'
import { berechneGesamt } from '../../lib/preisberechnung'
import { currency, meters } from './constants'
import { toPricePosition } from './priceAdapter'
import type { Room } from './types'

export function TotalSummary({ rooms }: { rooms: Room[] }) {
  const total = berechneGesamt(rooms.map((room) => room.elements.map(toPricePosition)))
  const cards = [
    { label: 'Räume gesamt', value: String(total.anzahlRaeume), icon: Building2 },
    { label: 'Elemente gesamt', value: String(total.anzahlElemente), icon: Layers3 },
    { label: 'Laufende Meter', value: `${meters.format(total.laufendeMeterGesamt)} m`, icon: Ruler },
    { label: 'Einkauf gesamt', value: currency.format(total.einkaufGesamt), icon: Calculator },
  ]

  return (
    <section className="rounded-3xl bg-anthracite p-5 text-white shadow-xl sm:p-7">
      <div><p className="text-sm font-bold text-orange">Gesamtkalkulation</p><h2 className="mt-1 text-2xl font-bold">Gesamtübersicht</h2><p className="mt-1 text-xs text-neutral-400">Alle Räume und Positionen zusammengefasst</p></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl bg-white/7 p-4"><div className="flex items-center gap-2 text-neutral-400"><Icon size={16} /><p className="text-xs font-semibold">{label}</p></div><p className="mt-3 text-2xl font-bold">{value}</p></div>)}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Total label="Verkauf gesamt" value={total.gueltig ? currency.format(total.verkaufGesamt) : '—'} />
        <Total label="Gesamtgewinn" value={total.gueltig ? currency.format(total.gewinnGesamt) : '—'} highlight />
        <Total label="Status" value={total.gueltig ? 'Vollständig' : 'Eingaben unvollständig'} />
      </div>
    </section>
  )
}

function Total({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs font-semibold text-neutral-400">{label}</p><p className={`mt-2 text-xl font-bold ${highlight && value !== '—' ? 'text-emerald-400' : ''}`}>{value}</p></div>
}
