import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { inputClass } from './constants'

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={className}><span className="mb-1.5 block text-xs font-bold text-neutral-600">{label}</span>{children}</label>
}

export function SelectField({ label, value, options, onChange, className = '' }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void; className?: string }) {
  return <Field label={label} className={className}><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>{options.map((option) => <option key={option} value={option}>{option || 'Bitte auswählen'}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" /></div></Field>
}
