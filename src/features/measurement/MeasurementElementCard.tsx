import { Minus, Plus, Trash2 } from 'lucide-react'
import { berechneMasse } from '../../lib/aufmass'
import { colors, elementTypes, factors, inputClass, meshes, number, pleatedBlinds, profiles } from './constants'
import { Field, SelectField } from './FormFields'
import type { MeasurementEntry } from './types'

type Props = {
  element: MeasurementEntry
  positionNumber: number
  onChange: (patch: Partial<MeasurementEntry>) => void
  onRemove: () => void
}

const positiveInput = (value: string) => value === '' || Number(value) > 0

export function MeasurementElementCard({ element, positionNumber, onChange, onRemove }: Props) {
  const measurements = berechneMasse(Number(element.widthMm), Number(element.heightMm))
  const factorValid = element.factor !== 'custom' || Number(element.customFactor) > 0

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/70 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-anthracite text-sm font-black text-white">{positionNumber}</span><div><h3 className="text-sm font-bold text-anthracite">Position {positionNumber}</h3><p className="text-xs text-neutral-500">{element.type}</p></div></div>
        <button type="button" onClick={onRemove} aria-label={`Position ${positionNumber} entfernen`} className="grid size-10 place-items-center rounded-xl text-neutral-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></button>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
        <SelectField label="Elementart" value={element.type} options={elementTypes} onChange={(type) => onChange({ type })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Breite (mm)"><input type="number" min="0.01" step="1" inputMode="decimal" value={element.widthMm} onChange={(event) => positiveInput(event.target.value) && onChange({ widthMm: event.target.value })} placeholder="Größer 0" className={inputClass} /></Field>
          <Field label="Höhe (mm)"><input type="number" min="0.01" step="1" inputMode="decimal" value={element.heightMm} onChange={(event) => positiveInput(event.target.value) && onChange({ heightMm: event.target.value })} placeholder="Größer 0" className={inputClass} /></Field>
        </div>
        <Field label="Stückzahl"><div className="flex min-h-11 items-center justify-between rounded-xl border border-neutral-200 bg-white p-1"><button type="button" onClick={() => onChange({ quantity: Math.max(1, element.quantity - 1) })} disabled={element.quantity <= 1} className="grid size-9 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-30" aria-label="Stückzahl verringern"><Minus size={16} /></button><span className="text-sm font-bold">{element.quantity}</span><button type="button" onClick={() => onChange({ quantity: element.quantity + 1 })} className="grid size-9 place-items-center rounded-lg bg-orange-soft text-orange hover:bg-orange hover:text-white" aria-label="Stückzahl erhöhen"><Plus size={16} /></button></div></Field>
        <SelectField label="Profil" value={element.profile} options={profiles} onChange={(profile) => onChange({ profile })} />
        <SelectField label="Gewebe" value={element.mesh} options={meshes} onChange={(mesh) => onChange({ mesh })} />
        <SelectField label="Plissee" value={element.pleatedBlind} options={pleatedBlinds} onChange={(pleatedBlind) => onChange({ pleatedBlind })} />
        <SelectField label="Innenfarbe" value={element.colorInside} options={colors} onChange={(colorInside) => onChange({ colorInside })} />
        <SelectField label="Außenfarbe" value={element.colorOutside} options={colors} onChange={(colorOutside) => onChange({ colorOutside })} />
        <div className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-neutral-600">Faktor</span><div className="flex flex-wrap gap-1.5">{factors.map((factor) => <button key={factor} type="button" onClick={() => onChange({ factor })} className={`min-h-11 rounded-xl px-3 text-xs font-bold transition ${element.factor === factor ? 'bg-orange text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{factor === 'custom' ? 'Eigener Faktor' : `×${factor.replace('.', ',')}`}</button>)}</div></div>
        {element.factor === 'custom' && <Field label="Eigener Faktor"><input type="number" min="0.01" step="0.1" value={element.customFactor} onChange={(event) => positiveInput(event.target.value) && onChange({ customFactor: event.target.value })} placeholder="Größer 0" aria-invalid={!factorValid} className={inputClass} />{!factorValid && <span className="mt-1 block text-xs font-semibold text-red-600">Der Faktor muss größer als 0 sein.</span>}</Field>}
        <Field label="Notiz" className="sm:col-span-2 xl:col-span-4"><textarea rows={2} value={element.note} onChange={(event) => onChange({ note: event.target.value })} placeholder="Notiz zu dieser Position …" className={`${inputClass} resize-y py-3`} /></Field>
      </div>

      <footer className="border-t border-neutral-100 bg-neutral-50 px-4 py-4 sm:px-5">
        {!measurements.gueltig && <p className="mb-3 text-xs font-semibold text-red-600">Breite und Höhe müssen größer als 0 sein.</p>}
        <div className="grid gap-3 sm:grid-cols-2"><Measure label="Umfang = (Breite + Höhe) × 2" value={measurements.gueltig ? `${number.format(measurements.umfangMm)} mm` : '—'} /><Measure label="Fläche = Breite × Höhe" value={measurements.gueltig ? `${number.format(measurements.flaecheMm2)} mm² · ${number.format(measurements.flaecheM2)} m²` : '—'} /></div>
      </footer>
    </article>
  )
}

function Measure({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200"><p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className="mt-1 text-base font-bold text-anthracite">{value}</p></div>
}
