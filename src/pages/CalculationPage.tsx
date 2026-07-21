import { useState } from 'react'
import { CirclePlus, FileText, RotateCcw } from 'lucide-react'
import { CustomerSection } from '../features/calculation/CustomerSection'
import { RoomCard } from '../features/calculation/RoomCard'
import { TotalSummary } from '../features/calculation/TotalSummary'
import { createRoom, emptyCustomer, type CustomerData, type Room } from '../features/calculation/types'

export function CalculationPage() {
  const [customer, setCustomer] = useState<CustomerData>(emptyCustomer)
  const [rooms, setRooms] = useState<Room[]>([createRoom()])

  const updateRoom = (room: Room) => setRooms((current) => current.map((item) => item.id === room.id ? room : item))
  const addRoom = () => setRooms((current) => [...current, createRoom()])
  const removeRoom = (room: Room) => {
    if (room.elements.length > 0 && !window.confirm(`Raum „${room.name || 'Unbenannt'}“ enthält ${room.elements.length} Element(e). Wirklich entfernen?`)) return
    setRooms((current) => current.filter((item) => item.id !== room.id))
  }
  const resetAll = () => {
    if (!window.confirm('Möchtest du die gesamte Kalkulation wirklich zurücksetzen? Alle lokalen Eingaben gehen verloren.')) return
    setCustomer(emptyCustomer())
    setRooms([createRoom()])
  }

  return (
    <div className="space-y-7 sm:space-y-9">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-bold text-orange">Aufmaß und Projektplanung</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Kalkulation</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">Räume anlegen, Elemente erfassen und Preise unmittelbar kalkulieren.</p></div>
        <span className="w-fit rounded-full bg-orange-soft px-3 py-1.5 text-xs font-bold text-orange">Nur lokal · Nicht gespeichert</span>
      </section>

      <CustomerSection customer={customer} onChange={setCustomer} />

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-orange">Aufmaßbereiche</p><h2 className="mt-1 text-2xl font-bold text-anthracite">Räume</h2><p className="mt-1 text-sm text-neutral-500">{rooms.length} {rooms.length === 1 ? 'Raum angelegt' : 'Räume angelegt'}</p></div><button type="button" onClick={addRoom} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange px-4 text-sm font-bold text-white shadow-lg shadow-orange/15 transition hover:brightness-95"><CirclePlus size={18} /> Raum hinzufügen</button></div>
        <div className="space-y-6">
          {rooms.length === 0 && <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center"><p className="font-bold text-anthracite">Noch kein Raum angelegt</p><p className="mt-2 text-sm text-neutral-500">Füge einen Raum hinzu, um mit dem Aufmaß zu beginnen.</p></div>}
          {rooms.map((room, roomIndex) => {
            const positionStart = rooms.slice(0, roomIndex).reduce((sum, item) => sum + item.elements.length, 0) + 1
            return <RoomCard key={room.id} room={room} roomNumber={roomIndex + 1} positionStart={positionStart} onChange={updateRoom} onRemove={() => removeRoom(room)} />
          })}
        </div>
      </section>

      <TotalSummary rooms={rooms} />

      <section className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={resetAll} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50"><RotateCcw size={17} /> Gesamte Kalkulation zurücksetzen</button>
        <button type="button" disabled className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-neutral-300 px-5 text-sm font-bold text-neutral-500"><FileText size={17} /> Angebot erstellen</button>
      </section>
    </div>
  )
}
