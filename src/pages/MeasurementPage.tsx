import { useState } from 'react'
import { BriefcaseBusiness, CirclePlus, MapPin, UserRound } from 'lucide-react'
import { inputClass } from '../features/measurement/constants'
import { Field, SelectField } from '../features/measurement/FormFields'
import { MeasurementRoomCard } from '../features/measurement/MeasurementRoomCard'
import { createMeasurementProject, createMeasurementRoom, type MeasurementProject, type MeasurementRoom } from '../features/measurement/types'

export function MeasurementPage() {
  const [project, setProject] = useState<MeasurementProject>(createMeasurementProject)
  const patchProject = (patch: Partial<MeasurementProject>) => setProject((current) => ({ ...current, ...patch }))
  const updateRoom = (room: MeasurementRoom) => patchProject({ rooms: project.rooms.map((item) => item.id === room.id ? room : item) })
  const addRoom = () => patchProject({ rooms: [...project.rooms, createMeasurementRoom()] })
  const removeRoom = (id: string) => patchProject({ rooms: project.rooms.filter((room) => room.id !== id) })
  const elementCount = project.rooms.reduce((sum, room) => sum + room.elements.length, 0)

  return (
    <div className="space-y-7 sm:space-y-9">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-bold text-orange">Projektaufnahme</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Aufmaß</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">Projektdaten, Räume und Elemente direkt vor Ort vollständig erfassen.</p></div>
        <span className="w-fit rounded-full bg-orange-soft px-3 py-1.5 text-xs font-bold text-orange">Nur lokal · Nicht gespeichert</span>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-orange-soft text-orange"><BriefcaseBusiness size={20} /></div><div><h2 className="font-bold text-anthracite">Projektdaten</h2><p className="text-xs text-neutral-500">Grunddaten für das neue Aufmaß</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Projektname" className="sm:col-span-2"><input value={project.projectName} onChange={(event) => patchProject({ projectName: event.target.value })} placeholder="z. B. Insektenschutz Familie Müller" className={inputClass} /></Field>
          <Field label="Datum"><input type="date" value={project.date} onChange={(event) => patchProject({ date: event.target.value })} className={inputClass} /></Field>
          <Field label="Bearbeiter"><div className="relative"><UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={project.employee} onChange={(event) => patchProject({ employee: event.target.value })} placeholder="Name des Mitarbeiters" className={`${inputClass} pl-10`} /></div></Field>
          <SelectField label="Kunde" value={project.customerMode} onChange={(customerMode) => patchProject({ customerMode, customerName: '' })} options={['', 'Bestehenden Kunden auswählen', 'Neuen Kunden anlegen']} />
          {project.customerMode === 'Bestehenden Kunden auswählen' && <SelectField label="Bestehender Kunde" value={project.customerName} onChange={(customerName) => patchProject({ customerName })} options={['', 'Beispielkunde (Platzhalter)']} />}
          {project.customerMode === 'Neuen Kunden anlegen' && <Field label="Neuer Kunde"><input value={project.customerName} onChange={(event) => patchProject({ customerName: event.target.value })} placeholder="Kundenname oder Firma" className={inputClass} /></Field>}
          <Field label="Adresse" className="sm:col-span-2"><div className="relative"><MapPin size={17} className="pointer-events-none absolute left-3.5 top-3.5 text-neutral-400" /><textarea rows={2} value={project.address} onChange={(event) => patchProject({ address: event.target.value })} placeholder="Straße, Hausnummer, PLZ und Ort" className={`${inputClass} resize-y py-3 pl-10`} /></div></Field>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-orange">Aufmaßbereiche</p><h2 className="mt-1 text-2xl font-bold text-anthracite">Räume und Elemente</h2><p className="mt-1 text-sm text-neutral-500">{project.rooms.length} {project.rooms.length === 1 ? 'Raum' : 'Räume'} · {elementCount} {elementCount === 1 ? 'Element' : 'Elemente'}</p></div><button type="button" onClick={addRoom} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange px-4 text-sm font-bold text-white shadow-lg shadow-orange/15 transition hover:brightness-95"><CirclePlus size={18} /> Raum hinzufügen</button></div>
        <div className="space-y-6">
          {project.rooms.length === 0 && <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center"><p className="font-bold text-anthracite">Noch kein Raum angelegt</p><p className="mt-2 text-sm text-neutral-500">Füge einen Raum hinzu, um mit dem Aufmaß zu beginnen.</p></div>}
          {project.rooms.map((room, roomIndex) => {
            const positionStart = project.rooms.slice(0, roomIndex).reduce((sum, item) => sum + item.elements.length, 0) + 1
            return <MeasurementRoomCard key={room.id} room={room} roomNumber={roomIndex + 1} positionStart={positionStart} onChange={updateRoom} onRemove={() => removeRoom(room.id)} />
          })}
        </div>
      </section>
    </div>
  )
}
