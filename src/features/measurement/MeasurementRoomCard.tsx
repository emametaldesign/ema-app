import { CirclePlus, Trash2 } from 'lucide-react'
import { inputClass } from './constants'
import { Field } from './FormFields'
import { MeasurementElementCard } from './MeasurementElementCard'
import { createMeasurementEntry, type MeasurementEntry, type MeasurementRoom } from './types'

type Props = {
  room: MeasurementRoom
  roomNumber: number
  positionStart: number
  onChange: (room: MeasurementRoom) => void
  onRemove: () => void
}

export function MeasurementRoomCard({ room, roomNumber, positionStart, onChange, onRemove }: Props) {
  const updateElement = (id: string, patch: Partial<MeasurementEntry>) => onChange({ ...room, elements: room.elements.map((element) => element.id === id ? { ...element, ...patch } : element) })
  const removeElement = (id: string) => onChange({ ...room, elements: room.elements.filter((element) => element.id !== id) })
  const addElement = () => onChange({ ...room, elements: [...room.elements, createMeasurementEntry()] })

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm">
      <header className="flex flex-col gap-4 border-b border-neutral-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="flex flex-1 items-end gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange text-lg font-black text-white">{roomNumber}</span><Field label={`Raum ${roomNumber} · Raumname`} className="w-full max-w-xl"><input value={room.name} onChange={(event) => onChange({ ...room, name: event.target.value })} placeholder="z. B. Wohnzimmer, Küche oder Schlafzimmer" className={inputClass} /></Field></div>
        <button type="button" onClick={onRemove} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 size={17} /> Raum löschen</button>
      </header>
      <div className="space-y-4 p-3 sm:p-5">
        {room.elements.length === 0 && <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">Dieser Raum enthält noch kein Element.</div>}
        {room.elements.map((element, index) => <MeasurementElementCard key={element.id} element={element} positionNumber={positionStart + index} onChange={(patch) => updateElement(element.id, patch)} onRemove={() => removeElement(element.id)} />)}
        <button type="button" onClick={addElement} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange/50 bg-orange-soft text-sm font-bold text-orange transition hover:border-orange hover:bg-orange hover:text-white"><CirclePlus size={18} /> Element hinzufügen</button>
      </div>
    </section>
  )
}
