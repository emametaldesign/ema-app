import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { inputClass, labelClass } from './constants'

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={className}><span className={labelClass}>{label}</span>{children}</label>
}

export function SelectField({ value, onChange, options, ariaLabel }: { value: string; onChange: (value: string) => void; options: readonly string[]; ariaLabel: string }) {
  return (
    <div className="relative">
      <select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
        {options.map((option) => <option key={option} value={option}>{option || 'Bitte auswählen'}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
    </div>
  )
}
