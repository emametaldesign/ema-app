import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Calculator, ChevronDown, CirclePlus, FileText, Minus, Plus, RotateCcw, Trash2, Users } from 'lucide-react'
import { berechneKalkulation, berechnePosition, type PreisPosition } from '../lib/preisberechnung'

const forms = ['Fenster', 'Balkontür', 'Doppelflügel', 'Schiebeanlage', 'Dachfenster', 'Kellerfenster', 'Rundbogen', 'Schräge', 'Dreieck', 'Sonderform']
const profiles = ['İnce, 25 mm sichtbar und 18 mm tief', 'Kalın, 35 mm sichtbar und 18 mm tief']
const systems = ['Fest-Rahmen Standard', 'Fest-Rahmen Pollengewebe', 'Double Sineklik', 'Çift Gazor Plissee', 'Honeycomb', 'Blackout', 'Economy']
const colors = ['Weiß', 'Anthrazit', 'Schwarz', 'Silber', 'Braun', 'Sonderfarbe']
const factors = ['2', '3', '4', '4.5', 'custom'] as const

type Factor = (typeof factors)[number]

type ElementItem = {
  id: number
  room: string
  position: string
  form: string
  width: string
  height: string
  quantity: number
  profile: string
  colorInside: string
  colorOutside: string
  system: string
  noThreshold: boolean
  note: string
}

const createElement = (id: number): ElementItem => ({
  id,
  room: '',
  position: '',
  form: 'Fenster',
  width: '',
  height: '',
  quantity: 1,
  profile: profiles[0],
  colorInside: 'Weiß',
  colorOutside: 'Anthrazit',
  system: systems[0],
  noThreshold: false,
  note: '',
})

const inputClass = 'min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-anthracite outline-none transition placeholder:text-neutral-400 focus:border-orange focus:ring-3 focus:ring-orange/10'
const labelClass = 'mb-1.5 block text-xs font-bold text-neutral-600'
const geld = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

const alsPreisPosition = (item: ElementItem): PreisPosition => ({
  breiteCm: Number(item.width),
  hoeheCm: Number(item.height),
  stueckzahl: item.quantity,
  form: item.form,
  system: item.system,
  ohneSchwelle: item.noThreshold,
})

const positiveEingabe = (value: string) => value === '' || Number(value) > 0

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={className}><span className={labelClass}>{label}</span>{children}</label>
}

function SelectField({ value, onChange, options, ariaLabel }: { value: string; onChange: (value: string) => void; options: string[]; ariaLabel: string }) {
  return (
    <div className="relative">
      <select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
    </div>
  )
}

function ElementCard({ item, index, canRemove, onChange, onRemove }: {
  item: ElementItem
  index: number
  canRemove: boolean
  onChange: (patch: Partial<ElementItem>) => void
  onRemove: () => void
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/70 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-orange text-sm font-black text-white">{index + 1}</span>
          <div><h3 className="text-sm font-bold text-anthracite">Element {index + 1}</h3><p className="text-xs text-neutral-500">Position konfigurieren</p></div>
        </div>
        <button type="button" onClick={onRemove} disabled={!canRemove} title={canRemove ? 'Element entfernen' : 'Mindestens ein Element erforderlich'} className="grid size-10 place-items-center rounded-xl text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400">
          <Trash2 size={18} />
        </button>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
        <Field label="Raum"><input value={item.room} onChange={(event) => onChange({ room: event.target.value })} placeholder="z. B. Wohnzimmer" className={inputClass} /></Field>
        <Field label="Positionsbezeichnung"><input value={item.position} onChange={(event) => onChange({ position: event.target.value })} placeholder="z. B. Fenster links" className={inputClass} /></Field>
        <Field label="Form"><SelectField ariaLabel="Form" value={item.form} onChange={(form) => onChange({ form })} options={forms} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Breite (cm)"><input type="number" min="0.01" step="0.1" inputMode="decimal" value={item.width} onChange={(event) => positiveEingabe(event.target.value) && onChange({ width: event.target.value })} placeholder="Größer 0" className={inputClass} /></Field>
          <Field label="Höhe (cm)"><input type="number" min="0.01" step="0.1" inputMode="decimal" value={item.height} onChange={(event) => positiveEingabe(event.target.value) && onChange({ height: event.target.value })} placeholder="Größer 0" className={inputClass} /></Field>
        </div>

        <Field label="Stückzahl">
          <div className="flex min-h-11 items-center justify-between rounded-xl border border-neutral-200 bg-white p-1">
            <button type="button" onClick={() => onChange({ quantity: Math.max(1, item.quantity - 1) })} disabled={item.quantity <= 1} className="grid size-9 place-items-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-30" aria-label="Stückzahl verringern"><Minus size={16} /></button>
            <span className="min-w-10 text-center text-sm font-bold text-anthracite">{item.quantity}</span>
            <button type="button" onClick={() => onChange({ quantity: item.quantity + 1 })} className="grid size-9 place-items-center rounded-lg bg-orange-soft text-orange transition hover:bg-orange hover:text-white" aria-label="Stückzahl erhöhen"><Plus size={16} /></button>
          </div>
        </Field>
        <Field label="Profilserie" className="xl:col-span-2"><SelectField ariaLabel="Profilserie" value={item.profile} onChange={(profile) => onChange({ profile })} options={profiles} /></Field>
        <Field label="System"><SelectField ariaLabel="System" value={item.system} onChange={(system) => onChange({ system })} options={systems} /></Field>
        <div className="hidden xl:block" />
        <Field label="Farbe innen"><SelectField ariaLabel="Farbe innen" value={item.colorInside} onChange={(colorInside) => onChange({ colorInside })} options={colors} /></Field>
        <Field label="Farbe außen"><SelectField ariaLabel="Farbe außen" value={item.colorOutside} onChange={(colorOutside) => onChange({ colorOutside })} options={colors} /></Field>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm font-semibold text-neutral-700">
          <input type="checkbox" checked={item.noThreshold} onChange={(event) => onChange({ noThreshold: event.target.checked })} className="size-4 accent-orange" /> Ohne Schwelle
        </label>
        <Field label="Positionsnotiz" className="sm:col-span-2 xl:col-span-4"><textarea value={item.note} onChange={(event) => onChange({ note: event.target.value })} rows={3} placeholder="Besonderheiten zu dieser Position …" className={`${inputClass} resize-y py-3`} /></Field>
      </div>
    </article>
  )
}

export function CalculationPage() {
  const [customer, setCustomer] = useState({ selection: '', name: '', phone: '', address: '', measureDate: '', note: '' })
  const [elements, setElements] = useState<ElementItem[]>([createElement(1)])
  const [nextId, setNextId] = useState(2)
  const [factor, setFactor] = useState<Factor>('3')
  const [customFactor, setCustomFactor] = useState('')

  const multiplier = factor === 'custom' ? Number(customFactor) : Number(factor)
  const preisPositionen = useMemo(() => elements.map(alsPreisPosition), [elements])
  const positionsErgebnisse = useMemo(() => preisPositionen.map(berechnePosition), [preisPositionen])
  const kalkulation = useMemo(() => berechneKalkulation(preisPositionen, multiplier), [preisPositionen, multiplier])
  const masseVollstaendig = elements.every((item) => Number(item.width) > 0 && Number(item.height) > 0)
  const faktorGueltig = multiplier > 0 && Number.isFinite(multiplier)

  const updateElement = (id: number, patch: Partial<ElementItem>) => setElements((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  const addElement = () => {
    setElements((current) => [...current, createElement(nextId)])
    setNextId((current) => current + 1)
  }
  const removeElement = (id: number) => setElements((current) => current.length > 1 ? current.filter((item) => item.id !== id) : current)
  const resetCalculation = () => {
    setCustomer({ selection: '', name: '', phone: '', address: '', measureDate: '', note: '' })
    setElements([createElement(1)])
    setNextId(2)
    setFactor('3')
    setCustomFactor('')
  }

  return (
    <div className="space-y-7 sm:space-y-9">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-bold text-orange">Projektplanung</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Kalkulation</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">Positionen erfassen und für die spätere EMA-Preiskalkulation vorbereiten.</p></div>
        <span className="w-fit rounded-full bg-orange-soft px-3 py-1.5 text-xs font-bold text-orange">Nicht gespeichert</span>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-orange-soft text-orange"><Users size={20} /></div><div><h2 className="font-bold text-anthracite">Kundendaten</h2><p className="text-xs text-neutral-500">Angaben für diese Kalkulation</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Kunde auswählen"><SelectField ariaLabel="Kunde auswählen" value={customer.selection} onChange={(selection) => setCustomer({ ...customer, selection })} options={['', 'Neuen Kunden erfassen', 'Beispielkunde (Platzhalter)']} /></Field>
          <Field label="Kundenname"><input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Vor- und Nachname / Firma" className={inputClass} /></Field>
          <Field label="Telefonnummer"><input type="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="+49 …" className={inputClass} /></Field>
          <Field label="Aufmaßdatum"><input type="date" value={customer.measureDate} onChange={(event) => setCustomer({ ...customer, measureDate: event.target.value })} className={inputClass} /></Field>
          <Field label="Adresse" className="sm:col-span-2"><input value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Straße, Hausnummer, PLZ, Ort" className={inputClass} /></Field>
          <Field label="Notiz" className="sm:col-span-2"><textarea rows={2} value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })} placeholder="Allgemeine Notiz …" className={`${inputClass} resize-y py-3`} /></Field>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-anthracite">Positionen / Elemente</h2><p className="mt-1 text-sm text-neutral-500">{elements.length} {elements.length === 1 ? 'Element' : 'Elemente'} angelegt</p></div><button type="button" onClick={addElement} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange px-4 text-sm font-bold text-white shadow-lg shadow-orange/15 transition hover:brightness-95"><CirclePlus size={18} /> Neues Element hinzufügen</button></div>
        <div className="space-y-4">{elements.map((item, index) => <ElementCard key={item.id} item={item} index={index} canRemove={elements.length > 1} onChange={(patch) => updateElement(item.id, patch)} onRemove={() => removeElement(item.id)} />)}</div>
      </section>

      <section className="rounded-2xl bg-anthracite p-5 text-white shadow-lg sm:p-7">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-orange"><Calculator size={21} /></div><div><h2 className="font-bold">Kalkulationsübersicht</h2><p className="text-xs text-neutral-400">Interne EMA-Preisberechnung</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white/7 p-4"><p className="text-xs font-semibold text-neutral-400">Laufende Meter gesamt</p><p className="mt-2 text-2xl font-bold">{kalkulation.laufendeMeterGesamt.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m</p></div>
          <div className="rounded-xl bg-white/7 p-4"><p className="text-xs font-semibold text-neutral-400">Einkaufspreis gesamt</p><p className="mt-2 text-2xl font-bold">{masseVollstaendig ? geld.format(kalkulation.einkaufGesamt) : '—'}</p></div>
          <div className="rounded-xl bg-white/7 p-4"><p className="text-xs font-semibold text-neutral-400">Verkaufspreis gesamt</p><p className="mt-2 text-2xl font-bold">{kalkulation.gueltig ? geld.format(kalkulation.verkaufGesamt) : '—'}</p></div>
          <div className="rounded-xl bg-white/7 p-4"><p className="text-xs font-semibold text-neutral-400">Gesamtgewinn</p><p className={`mt-2 text-2xl font-bold ${kalkulation.gueltig ? 'text-emerald-400' : ''}`}>{kalkulation.gueltig ? geld.format(kalkulation.gewinnGesamt) : '—'}</p></div>
        </div>
        <div className="mt-5"><p className="mb-2 text-xs font-bold text-neutral-300">Multiplikator</p><div className="flex flex-wrap gap-2">{factors.map((item) => <button key={item} type="button" onClick={() => setFactor(item)} className={`min-h-10 rounded-xl px-4 text-sm font-bold transition ${factor === item ? 'bg-orange text-white' : 'bg-white/8 text-neutral-300 hover:bg-white/12'}`}>{item === 'custom' ? 'Eigener Faktor' : `×${item.replace('.', ',')}`}</button>)}</div>{factor === 'custom' && <div><input type="number" min="0.01" step="0.1" value={customFactor} onChange={(event) => positiveEingabe(event.target.value) && setCustomFactor(event.target.value)} placeholder="Faktor größer 0" aria-invalid={!faktorGueltig} className="mt-3 min-h-11 w-full max-w-xs rounded-xl border border-white/15 bg-white/8 px-3.5 text-sm text-white outline-none focus:border-orange" />{!faktorGueltig && <p className="mt-2 text-xs font-semibold text-red-300">Bitte einen Faktor größer als 0 eingeben.</p>}</div>}</div>
        {!masseVollstaendig && <p className="mt-5 rounded-xl bg-orange/15 px-4 py-3 text-xs font-semibold text-orange-200">Für jede Position müssen Breite und Höhe größer als 0 sein.</p>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-4 py-5 sm:px-6"><h2 className="font-bold text-anthracite">Zusammenfassung</h2><p className="mt-1 text-xs text-neutral-500">Alle erfassten Positionen im Überblick</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500"><tr>{['Position', 'Maße', 'Anzahl', 'Profil', 'Innenfarbe', 'Außenfarbe', 'System', 'Einkauf', 'Verkauf'].map((heading) => <th key={heading} className="px-4 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{elements.map((item, index) => {
          const ergebnis = positionsErgebnisse[index]
          const einzelKalkulation = berechneKalkulation([preisPositionen[index]], multiplier)
          return <tr key={item.id} className="text-neutral-700"><td className="px-4 py-4"><p className="font-bold text-anthracite">{item.position || `Element ${index + 1}`}</p><p className="text-xs text-neutral-500">{item.room || 'Kein Raum'} · {item.form}</p></td><td className="whitespace-nowrap px-4 py-4">{item.width || '—'} × {item.height || '—'} cm</td><td className="px-4 py-4">{item.quantity}</td><td className="max-w-52 px-4 py-4 text-xs">{item.profile}</td><td className="px-4 py-4">{item.colorInside}</td><td className="px-4 py-4">{item.colorOutside}</td><td className="whitespace-nowrap px-4 py-4"><p>{item.system}</p>{item.noThreshold && <p className="mt-1 text-xs font-semibold text-orange">+ ohne Schwelle</p>}</td><td className="whitespace-nowrap px-4 py-4 font-semibold">{ergebnis.gueltig ? geld.format(ergebnis.einkaufGesamt) : '—'}</td><td className="whitespace-nowrap px-4 py-4 font-semibold">{einzelKalkulation.gueltig ? geld.format(einzelKalkulation.verkaufGesamt) : '—'}</td></tr>
        })}</tbody><tfoot className="border-t-2 border-neutral-200 bg-neutral-50 font-bold text-anthracite"><tr><td colSpan={7} className="px-4 py-4 text-right">Gesamtsumme</td><td className="whitespace-nowrap px-4 py-4">{masseVollstaendig ? geld.format(kalkulation.einkaufGesamt) : '—'}</td><td className="whitespace-nowrap px-4 py-4">{kalkulation.gueltig ? geld.format(kalkulation.verkaufGesamt) : '—'}</td></tr></tfoot></table></div>
      </section>

      <section className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={resetCalculation} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"><RotateCcw size={17} /> Kalkulation zurücksetzen</button>
        <button type="button" disabled className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-neutral-300 px-5 text-sm font-bold text-neutral-500"><FileText size={17} /> Angebot erstellen</button>
      </section>
    </div>
  )
}
