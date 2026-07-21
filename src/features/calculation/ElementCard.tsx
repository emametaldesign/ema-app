import { Minus, Plus, Trash2 } from 'lucide-react'
import type { ElementErgebnis } from '../../lib/preisberechnung'
import { colors, currency, factors, forms, inputClass, meters, profiles, systems } from './constants'
import { Field, SelectField } from './FormFields'
import type { MeasurementElement } from './types'

type ElementCardProps = {
  element: MeasurementElement
  positionNumber: number
  result: ElementErgebnis
  onChange: (patch: Partial<MeasurementElement>) => void
  onRemove: () => void
}

const positiveInput = (value: string) => value === '' || Number(value) > 0

export function ElementCard({ element, positionNumber, result, onChange, onRemove }: ElementCardProps) {
  const factorValid = element.factor !== 'custom' || Number(element.customFactor) > 0
  const dimensionsValid = Number(element.width) > 0 && Number(element.height) > 0

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/70 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-anthracite text-sm font-black text-white">{positionNumber}</span><div><h4 className="text-sm font-bold text-anthracite">Position {positionNumber}</h4><p className="text-xs text-neutral-500">{element.name || 'Unbenanntes Element'}</p></div></div>
        <button type="button" onClick={onRemove} aria-label={`Position ${positionNumber} entfernen`} className="grid size-10 place-items-center rounded-xl text-neutral-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></button>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
        <Field label="Bezeichnung"><input value={element.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="z. B. Fenster links" className={inputClass} /></Field>
        <Field label="Form"><SelectField ariaLabel="Form" value={element.form} onChange={(form) => onChange({ form })} options={forms} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Breite (cm)"><input type="number" min="0.01" step="0.1" inputMode="decimal" value={element.width} onChange={(event) => positiveInput(event.target.value) && onChange({ width: event.target.value })} placeholder="Größer 0" className={inputClass} /></Field>
          <Field label="Höhe (cm)"><input type="number" min="0.01" step="0.1" inputMode="decimal" value={element.height} onChange={(event) => positiveInput(event.target.value) && onChange({ height: event.target.value })} placeholder="Größer 0" className={inputClass} /></Field>
        </div>
        <Field label="Stückzahl"><div className="flex min-h-11 items-center justify-between rounded-xl border border-neutral-200 bg-white p-1"><button type="button" onClick={() => onChange({ quantity: Math.max(1, element.quantity - 1) })} disabled={element.quantity <= 1} className="grid size-9 place-items-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-30" aria-label="Stückzahl verringern"><Minus size={16} /></button><span className="min-w-10 text-center text-sm font-bold">{element.quantity}</span><button type="button" onClick={() => onChange({ quantity: element.quantity + 1 })} className="grid size-9 place-items-center rounded-lg bg-orange-soft text-orange transition hover:bg-orange hover:text-white" aria-label="Stückzahl erhöhen"><Plus size={16} /></button></div></Field>

        <Field label="Profilserie" className="sm:col-span-2"><SelectField ariaLabel="Profilserie" value={element.profile} onChange={(profile) => onChange({ profile })} options={profiles} /></Field>
        <Field label="Farbe innen"><SelectField ariaLabel="Farbe innen" value={element.colorInside} onChange={(colorInside) => onChange({ colorInside })} options={colors} /></Field>
        <Field label="Farbe außen"><SelectField ariaLabel="Farbe außen" value={element.colorOutside} onChange={(colorOutside) => onChange({ colorOutside })} options={colors} /></Field>
        <Field label="System" className="sm:col-span-2"><SelectField ariaLabel="System" value={element.system} onChange={(system) => onChange({ system })} options={systems} /></Field>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm font-semibold text-neutral-700"><input type="checkbox" checked={element.noThreshold} onChange={(event) => onChange({ noThreshold: event.target.checked })} className="size-4 accent-orange" /> Ohne Schwelle</label>
        <div><span className="mb-1.5 block text-xs font-bold text-neutral-600">Multiplikator</span><div className="flex flex-wrap gap-1.5">{factors.map((factor) => <button key={factor} type="button" onClick={() => onChange({ factor })} className={`min-h-11 rounded-xl px-3 text-xs font-bold transition ${element.factor === factor ? 'bg-orange text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{factor === 'custom' ? 'Eigener' : `×${factor.replace('.', ',')}`}</button>)}</div></div>
        {element.factor === 'custom' && <Field label="Eigener Faktor"><input type="number" min="0.01" step="0.1" value={element.customFactor} onChange={(event) => positiveInput(event.target.value) && onChange({ customFactor: event.target.value })} placeholder="Größer 0" aria-invalid={!factorValid} className={inputClass} />{!factorValid && <span className="mt-1 block text-xs font-semibold text-red-600">Faktor muss größer als 0 sein.</span>}</Field>}
        <Field label="Notiz" className="sm:col-span-2 xl:col-span-4"><textarea value={element.note} onChange={(event) => onChange({ note: event.target.value })} rows={2} placeholder="Notiz zu diesem Element …" className={`${inputClass} resize-y py-3`} /></Field>
      </div>

      <footer className="border-t border-neutral-100 bg-neutral-50 px-4 py-4 sm:px-5">
        {!dimensionsValid && <p className="mb-3 text-xs font-semibold text-red-600">Breite und Höhe müssen größer als 0 sein.</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Result label="Laufende Meter" value={result.gueltig ? `${meters.format(result.laufendeMeterGesamt)} m` : '—'} />
          <Result label="Einkauf" value={result.gueltig ? currency.format(result.einkaufGesamt) : '—'} />
          <Result label="Verkauf" value={result.gueltig ? currency.format(result.verkaufGesamt) : '—'} />
          <Result label="Gewinn" value={result.gueltig ? currency.format(result.gewinnGesamt) : '—'} highlight />
        </div>
      </footer>
    </article>
  )
}

function Result({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className={`mt-1 text-sm font-bold ${highlight && value !== '—' ? 'text-emerald-600' : 'text-anthracite'}`}>{value}</p></div>
}
