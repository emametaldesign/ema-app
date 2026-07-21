import type { ElementErgebnis } from '../../lib/preisberechnung'
import type { CalculationSetting, FactorOption, TechnicalElement } from '../../types/project'
import { currency, factors, inputClass, meters } from './constants'

export function SavedElementCalculation({ element, setting, result, onChange, gross = false, vatRate = 19 }: { element: TechnicalElement; setting: CalculationSetting; result: ElementErgebnis; onChange: (setting: CalculationSetting) => void; gross?: boolean; vatRate?: number }) {
  const patch = (value: Partial<CalculationSetting>) => onChange({ ...setting, ...value })
  const positive = (value: string) => value === '' || Number(value) > 0
  const nonNegative = (value: string) => value === '' || Number(value) >= 0
  return <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
    <header className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-4"><span className="grid size-9 place-items-center rounded-lg bg-anthracite text-sm font-black text-white">{element.positionNumber}</span><div><h4 className="font-bold text-anthracite">Position {element.positionNumber} · {element.type}</h4><p className="text-xs text-neutral-500">{element.widthMm || '—'} × {element.heightMm || '—'} mm · {element.quantity} Stück</p></div></header>
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tech label="Profil" value={element.profile} /><Tech label="System" value={element.system} /><Tech label="Gewebe / Plissee" value={`${element.mesh} · ${element.pleatedBlind}`} /><Tech label="Farben innen / außen" value={`${element.colorInside} / ${element.colorOutside}`} />
      {element.noThreshold && <p className="sm:col-span-2 xl:col-span-4 rounded-xl bg-orange-soft px-3 py-2 text-xs font-bold text-orange">Ohne Schwelle</p>}
      {element.note && <Tech label="Notiz" value={element.note} />}
    </div>
    <div className="border-t border-neutral-100 p-4"><div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <div><p className="mb-2 text-xs font-bold text-neutral-600">Multiplikator</p><div className="flex flex-wrap gap-1.5">{factors.map((factor) => <button key={factor} type="button" onClick={() => patch({ factor: factor as FactorOption })} className={`min-h-10 rounded-xl px-3 text-xs font-bold ${setting.factor === factor ? 'bg-orange text-white' : 'bg-neutral-100 text-neutral-600'}`}>{factor === 'custom' ? 'Eigener Faktor' : `×${factor.replace('.', ',')}`}</button>)}</div>{setting.factor === 'custom' && <input type="number" min="0.01" step="0.1" value={setting.customFactor} onChange={(event) => positive(event.target.value) && patch({ customFactor: event.target.value })} placeholder="Faktor größer 0" className={`${inputClass} mt-2 max-w-xs`} />}</div>
      <div className="grid grid-cols-2 gap-3"><label><span className="mb-1.5 block text-xs font-bold text-neutral-600">Zuschlag (€)</span><input type="number" min="0" step="0.01" value={setting.surcharge} onChange={(event) => nonNegative(event.target.value) && patch({ surcharge: event.target.value })} placeholder="0,00" className={inputClass} /></label><label><span className="mb-1.5 block text-xs font-bold text-neutral-600">Abschlag (€)</span><input type="number" min="0" step="0.01" value={setting.deduction} onChange={(event) => nonNegative(event.target.value) && patch({ deduction: event.target.value })} placeholder="0,00" className={inputClass} /></label></div>
    </div></div>
    <footer className="grid grid-cols-2 gap-3 border-t border-neutral-100 bg-neutral-50 p-4 sm:grid-cols-5"><Result label="Laufende Meter" value={result.gueltig ? `${meters.format(result.laufendeMeterGesamt)} m` : '—'} /><Result label="Einkauf" value={result.gueltig ? currency.format(result.einkaufGesamt) : '—'} /><Result label="Zu-/Abschlag" value={currency.format((Number(setting.surcharge) || 0) - (Number(setting.deduction) || 0))} /><Result label={`Verkauf ${gross ? 'brutto' : 'netto'}`} value={result.gueltig ? currency.format(result.verkaufGesamt * (gross ? 1 + vatRate / 100 : 1)) : '—'} /><Result label="Gewinn" value={result.gueltig ? currency.format(result.gewinnGesamt) : '—'} highlight /></footer>
  </article>
}

function Tech({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-neutral-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className="mt-1 text-sm font-semibold text-neutral-700">{value}</p></div> }
function Result({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className={`mt-1 font-bold ${highlight && value !== '—' ? 'text-emerald-600' : 'text-anthracite'}`}>{value}</p></div> }
