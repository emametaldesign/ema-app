import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, Check, CirclePlus, Copy, Edit3, MapPin, Play, Save, Trash2, UserRound } from 'lucide-react'
import { inputClass } from '../features/measurement/constants'
import { Field, SelectField } from '../features/measurement/FormFields'
import { MeasurementRoomCard } from '../features/measurement/MeasurementRoomCard'
import { createMeasurementProject, createMeasurementRoom, type MeasurementProject, type MeasurementRoom } from '../features/measurement/types'
import { deleteMeasurement, duplicateMeasurement, loadMeasurements, saveMeasurement } from '../lib/aufmassSpeicher'

type SaveState = 'saving' | 'saved'

export function MeasurementPage() {
  const navigate = useNavigate()
  const initial = useRef(loadMeasurements())
  const [project, setProject] = useState<MeasurementProject>(() => initial.current[0] ?? createMeasurementProject())
  const [savedProjects, setSavedProjects] = useState<MeasurementProject[]>(initial.current)
  const [saveState, setSaveState] = useState<SaveState>('saved')

  const refresh = () => setSavedProjects(loadMeasurements())
  const patchProject = (patch: Partial<MeasurementProject>) => setProject((current) => ({ ...current, ...patch }))
  const updateRoom = (room: MeasurementRoom) => setProject((current) => ({ ...current, rooms: current.rooms.map((item) => item.id === room.id ? room : item) }))

  useEffect(() => {
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      saveMeasurement(project)
      refresh()
      setSaveState('saved')
    }, 500)
    return () => window.clearTimeout(timer)
  }, [project])

  const manualSave = () => {
    const saved = saveMeasurement(project)
    setProject(saved)
    refresh()
    setSaveState('saved')
  }
  const newMeasurement = () => {
    if (!window.confirm('Möchtest du ein neues Aufmaß beginnen? Das aktuelle Aufmaß bleibt gespeichert.')) return
    manualSave()
    setProject(createMeasurementProject())
  }
  const removeSaved = (id: string) => {
    if (!window.confirm('Dieses gespeicherte Aufmaß wirklich löschen?')) return
    deleteMeasurement(id)
    if (project.id === id) setProject(createMeasurementProject())
    refresh()
  }
  const markComplete = (item: MeasurementProject) => {
    saveMeasurement({ ...item, status: 'Aufmaß abgeschlossen' })
    if (project.id === item.id) setProject((current) => ({ ...current, status: 'Aufmaß abgeschlossen' }))
    refresh()
  }
  const transfer = (item: MeasurementProject = project) => {
    const saved = saveMeasurement({ ...item, status: 'Kalkulation begonnen' })
    setProject(saved)
    refresh()
    navigate(`/kalkulation?aufmass=${saved.id}`)
  }
  const addRoom = () => patchProject({ rooms: [...project.rooms, createMeasurementRoom()] })
  const removeRoom = (id: string) => patchProject({ rooms: project.rooms.filter((room) => room.id !== id) })
  const elementCount = project.rooms.reduce((sum, room) => sum + room.elements.length, 0)

  return (
    <div className="space-y-7 sm:space-y-9">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-sm font-bold text-orange">Technische Erfassung</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Aufmaß</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">Technische Projektdaten beim Kunden erfassen – ohne Preise und Kalkulation.</p></div>
        <div className="flex flex-wrap items-center gap-2"><span className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-bold ${saveState === 'saving' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{saveState === 'saving' ? 'Wird gespeichert …' : <><Check size={14} /> Automatisch gespeichert</>}</span><button type="button" onClick={manualSave} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-700 hover:bg-neutral-50"><Save size={17} /> Aufmaß manuell speichern</button><button type="button" onClick={newMeasurement} className="min-h-11 rounded-xl bg-anthracite px-4 text-sm font-bold text-white hover:bg-neutral-800">Neues Aufmaß beginnen</button></div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-orange-soft text-orange"><BriefcaseBusiness size={20} /></div><div><h2 className="font-bold text-anthracite">Projektdaten</h2><p className="text-xs text-neutral-500">Status: {project.status}</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Projektname" className="sm:col-span-2"><input value={project.projectName} onChange={(event) => patchProject({ projectName: event.target.value })} placeholder="z. B. Insektenschutz Familie Müller" className={inputClass} /></Field>
          <Field label="Aufmaßdatum"><input type="date" value={project.measureDate} onChange={(event) => patchProject({ measureDate: event.target.value })} className={inputClass} /></Field>
          <Field label="Bearbeiter"><div className="relative"><UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={project.employee} onChange={(event) => patchProject({ employee: event.target.value })} placeholder="Name des Mitarbeiters" className={`${inputClass} pl-10`} /></div></Field>
          <SelectField label="Kunde" value={project.customerMode} onChange={(customerMode) => patchProject({ customerMode, customerName: '' })} options={['', 'Bestehenden Kunden auswählen', 'Neuen Kunden anlegen']} />
          {project.customerMode === 'Bestehenden Kunden auswählen' && <SelectField label="Bestehender Kunde" value={project.customerName} onChange={(customerName) => patchProject({ customerName })} options={['', 'Beispielkunde (Platzhalter)']} />}
          {project.customerMode === 'Neuen Kunden anlegen' && <Field label="Neuer Kunde"><input value={project.customerName} onChange={(event) => patchProject({ customerName: event.target.value })} placeholder="Kundenname oder Firma" className={inputClass} /></Field>}
          <Field label="Adresse" className="sm:col-span-2"><div className="relative"><MapPin size={17} className="pointer-events-none absolute left-3.5 top-3.5 text-neutral-400" /><textarea rows={2} value={project.address} onChange={(event) => patchProject({ address: event.target.value })} placeholder="Straße, Hausnummer, PLZ und Ort" className={`${inputClass} resize-y py-3 pl-10`} /></div></Field>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-orange">Technische Bereiche</p><h2 className="mt-1 text-2xl font-bold text-anthracite">Räume und Elemente</h2><p className="mt-1 text-sm text-neutral-500">{project.rooms.length} Räume · {elementCount} Elemente</p></div><button type="button" onClick={addRoom} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange px-4 text-sm font-bold text-white"><CirclePlus size={18} /> Raum hinzufügen</button></div>
        <div className="space-y-6">{project.rooms.map((room, roomIndex) => { const positionStart = project.rooms.slice(0, roomIndex).reduce((sum, item) => sum + item.elements.length, 0) + 1; return <MeasurementRoomCard key={room.id} room={room} roomNumber={roomIndex + 1} positionStart={positionStart} onChange={updateRoom} onRemove={() => removeRoom(room.id)} /> })}</div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div><p className="text-sm font-bold text-orange">Lokaler Speicher</p><h2 className="mt-1 text-2xl font-bold text-anthracite">Gespeicherte Aufmaße</h2><p className="mt-1 text-sm text-neutral-500">{savedProjects.length} lokal gespeichert</p></div>
        <div className="mt-5 space-y-3">{savedProjects.map((item) => <article key={item.id} className={`rounded-2xl border p-4 ${item.id === project.id ? 'border-orange bg-orange-soft/40' : 'border-neutral-200'}`}><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-anthracite">{item.projectName || 'Unbenanntes Aufmaß'}</h3><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">{item.status}</span></div><p className="mt-1 text-xs text-neutral-500">{item.customerName || 'Kein Kunde'} · {item.address || 'Keine Adresse'} · geändert {new Date(item.updatedAt).toLocaleString('de-DE')}</p></div><div className="flex flex-wrap gap-2"><Action icon={Edit3} label="Öffnen / bearbeiten" onClick={() => setProject(item)} /><Action icon={Copy} label="Duplizieren" onClick={() => { duplicateMeasurement(item.id); refresh() }} /><Action icon={Check} label="Abschließen" onClick={() => markComplete(item)} /><Action icon={Play} label="Zur Kalkulation" primary onClick={() => transfer(item)} /><Action icon={Trash2} label="Löschen" danger onClick={() => removeSaved(item.id)} /></div></div></article>)}{savedProjects.length === 0 && <p className="rounded-2xl bg-neutral-50 p-6 text-center text-sm text-neutral-500">Noch keine Aufmaße gespeichert.</p>}</div>
      </section>
    </div>
  )
}

function Action({ icon: Icon, label, onClick, primary = false, danger = false }: { icon: typeof Save; label: string; onClick: () => void; primary?: boolean; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${primary ? 'bg-orange text-white' : danger ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}><Icon size={14} /> {label}</button>
}
