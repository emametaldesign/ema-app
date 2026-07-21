import { Users } from 'lucide-react'
import { inputClass } from './constants'
import { Field, SelectField } from './FormFields'
import type { CustomerData } from './types'

export function CustomerSection({ customer, onChange }: { customer: CustomerData; onChange: (customer: CustomerData) => void }) {
  const patch = (value: Partial<CustomerData>) => onChange({ ...customer, ...value })
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-orange-soft text-orange"><Users size={20} /></div><div><h2 className="font-bold text-anthracite">Kundendaten</h2><p className="text-xs text-neutral-500">Angaben für dieses Aufmaß</p></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Kunde auswählen"><SelectField ariaLabel="Kunde auswählen" value={customer.selection} onChange={(selection) => patch({ selection })} options={['', 'Neuen Kunden erfassen', 'Beispielkunde (Platzhalter)']} /></Field>
        <Field label="Kundenname"><input value={customer.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Vor- und Nachname / Firma" className={inputClass} /></Field>
        <Field label="Telefonnummer"><input type="tel" value={customer.phone} onChange={(event) => patch({ phone: event.target.value })} placeholder="+49 …" className={inputClass} /></Field>
        <Field label="Aufmaßdatum"><input type="date" value={customer.measureDate} onChange={(event) => patch({ measureDate: event.target.value })} className={inputClass} /></Field>
        <Field label="Adresse" className="sm:col-span-2"><input value={customer.address} onChange={(event) => patch({ address: event.target.value })} placeholder="Straße, Hausnummer, PLZ, Ort" className={inputClass} /></Field>
        <Field label="Notiz" className="sm:col-span-2"><textarea rows={2} value={customer.note} onChange={(event) => patch({ note: event.target.value })} placeholder="Allgemeine Notiz …" className={`${inputClass} resize-y py-3`} /></Field>
      </div>
    </section>
  )
}
