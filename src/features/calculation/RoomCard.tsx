import { CirclePlus, RotateCcw, Trash2 } from 'lucide-react'
import { berechneElement, berechneRaum } from '../../lib/preisberechnung'
import { currency, inputClass, meters } from './constants'
import { ElementCard } from './ElementCard'
import { Field } from './FormFields'
import { toPricePosition } from './priceAdapter'
import { createElement, type MeasurementElement, type Room } from './types'

type RoomCardProps = {
  room: Room
  roomNumber: number
  positionStart: number
  onChange: (room: Room) => void
  onRemove: () => void
}

export function RoomCard({ room, roomNumber, positionStart, onChange, onRemove }: RoomCardProps) {
  const pricePositions = room.elements.map(toPricePosition)
  const results = pricePositions.map(berechneElement)
  const totals = berechneRaum(pricePositions)
  const updateElement = (id: string, patch: Partial<MeasurementElement>) => onChange({ ...room, elements: room.elements.map((element) => element.id === id ? { ...element, ...patch } : element) })
  const removeElement = (id: string) => onChange({ ...room, elements: room.elements.filter((element) => element.id !== id) })
  const addElement = () => onChange({ ...room, elements: [...room.elements, createElement()] })
  const resetRoom = () => onChange({ ...room, name: '', note: '', elements: [createElement()] })

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm">
      <header className="border-b border-neutral-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange text-lg font-black text-white">{roomNumber}</span><div><h2 className="text-lg font-bold text-anthracite">Raum {roomNumber}</h2><p className="text-xs text-neutral-500">{room.elements.length} {room.elements.length === 1 ? 'Element' : 'Elemente'}</p></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={resetRoom} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-bold text-neutral-600 hover:bg-neutral-50"><RotateCcw size={15} /> Raum zurücksetzen</button><button type="button" onClick={onRemove} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={15} /> Raum entfernen</button></div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Raumname"><input value={room.name} onChange={(event) => onChange({ ...room, name: event.target.value })} placeholder="z. B. Wohnzimmer" className={inputClass} /></Field><Field label="Raumnotiz"><input value={room.note} onChange={(event) => onChange({ ...room, note: event.target.value })} placeholder="Optionale Notiz" className={inputClass} /></Field></div>
      </header>

      <div className="space-y-4 p-3 sm:p-5">
        {room.elements.length === 0 && <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">Dieser Raum enthält noch keine Elemente.</div>}
        {room.elements.map((element, index) => <ElementCard key={element.id} element={element} positionNumber={positionStart + index} result={results[index]} onChange={(patch) => updateElement(element.id, patch)} onRemove={() => removeElement(element.id)} />)}
        <button type="button" onClick={addElement} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange/50 bg-orange-soft text-sm font-bold text-orange transition hover:border-orange hover:bg-orange hover:text-white"><CirclePlus size={18} /> Element hinzufügen</button>
      </div>

      <footer className="border-t border-neutral-200 bg-white p-4 sm:p-5"><div className="grid grid-cols-2 gap-3 lg:grid-cols-5"><RoomResult label="Elemente" value={String(totals.anzahlElemente)} /><RoomResult label="Laufende Meter" value={`${meters.format(totals.laufendeMeterGesamt)} m`} /><RoomResult label="Einkaufssumme" value={currency.format(totals.einkaufGesamt)} /><RoomResult label="Verkaufssumme" value={totals.gueltig ? currency.format(totals.verkaufGesamt) : '—'} /><RoomResult label="Gewinnsumme" value={totals.gueltig ? currency.format(totals.gewinnGesamt) : '—'} highlight /></div></footer>
    </section>
  )
}

function RoomResult({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className="rounded-xl bg-neutral-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className={`mt-1 text-sm font-bold ${highlight && value !== '—' ? 'text-emerald-600' : 'text-anthracite'}`}>{value}</p></div>
}
