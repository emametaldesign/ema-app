import { useEffect, useState } from 'react'
import { Check, FileText, Save } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { berechneAbschluss, berechneElement } from '../lib/preisberechnung'
import { loadMeasurements, saveMeasurement } from '../lib/aufmassSpeicher'
import { loadCalculation, saveCalculation } from '../lib/kalkulationsSpeicher'
import { createOfferFromCalculation } from '../lib/angebotsSpeicher'
import { currency, factors, inputClass } from '../features/calculation/constants'
import { measurementToPrice } from '../features/calculation/measurementAdapter'
import { SavedElementCalculation } from '../features/calculation/SavedElementCalculation'
import { createCalculationRecord, createCalculationSetting, type CalculationRecord, type CalculationSetting, type FactorOption, type MeasurementProject } from '../types/project'

function createRecord(project: MeasurementProject): CalculationRecord {
  const existing = loadCalculation(project.id)
  const base = createCalculationRecord(project.id)
  const settings = { ...(existing?.settings ?? {}) }
  project.rooms.flatMap((room) => room.elements).forEach((element) => { settings[element.id] ??= createCalculationSetting() })
  return { ...base, ...existing, settings, roomAssembly: { ...base.roomAssembly, ...existing?.roomAssembly } }
}

export function CalculationPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState(loadMeasurements)
  const requestedId = searchParams.get('aufmass') ?? ''
  const [selectedId, setSelectedId] = useState(() => projects.some((item) => item.id === requestedId) ? requestedId : '')
  const selected = projects.find((item) => item.id === selectedId)
  const [record, setRecord] = useState<CalculationRecord | null>(() => selected ? createRecord(selected) : null)
  const [saveState, setSaveState] = useState<'saving' | 'saved'>('saved')
  const [globalFactor, setGlobalFactor] = useState<FactorOption>('3')
  const [globalCustom, setGlobalCustom] = useState('')

  useEffect(() => { setRecord(selected ? createRecord(selected) : null) }, [selected])
  useEffect(() => {
    if (!record) return
    setSaveState('saving')
    const timer = window.setTimeout(() => { saveCalculation(record); setSaveState('saved') }, 500)
    return () => window.clearTimeout(timer)
  }, [record])

  const choose = (id: string) => { setSelectedId(id); setSearchParams(id ? { aufmass: id } : {}) }
  const getSetting = (id: string) => record?.settings[id] ?? createCalculationSetting()
  const updateSetting = (id: string, setting: CalculationSetting) => setRecord((current) => current ? ({ ...current, settings: { ...current.settings, [id]: setting } }) : current)
  const patchRecord = (patch: Partial<CalculationRecord>) => setRecord((current) => current ? { ...current, ...patch, completed: false } : current)
  const applyToAll = () => {
    if (!record || !selected || (globalFactor === 'custom' && Number(globalCustom) <= 0)) return
    const settings = { ...record.settings }
    selected.rooms.flatMap((room) => room.elements).forEach((element) => { settings[element.id] = { ...getSetting(element.id), factor: globalFactor, customFactor: globalFactor === 'custom' ? globalCustom : '' } })
    setRecord({ ...record, settings })
  }
  const finishCalculation = () => {
    if (!record || !selected) return
    if (!window.confirm('Möchtest du die Kalkulation abschließen? Danach kann ein Angebot erstellt werden.')) return
    const completed = { ...record, completed: true }
    saveCalculation(completed)
    setRecord(completed)
    saveMeasurement({ ...selected, status: 'Kalkuliert' })
    setProjects(loadMeasurements())
  }
  const createOffer = () => { if (!record?.completed || !selected) return; const offer = createOfferFromCalculation(selected, record); saveMeasurement({ ...selected, status: 'Angebot erstellt' }); navigate(`/angebote?angebot=${offer.id}`) }

  const allPriceRooms = selected?.rooms.map((room) => room.elements.map((element) => measurementToPrice(element, getSetting(element.id)))) ?? []
  const assemblyCosts = selected ? selected.rooms.reduce((sum, room) => sum + (Number(record?.roomAssembly[room.id]) || 0), 0) + (Number(record?.generalAssembly) || 0) : 0
  const total = berechneAbschluss(allPriceRooms, { montagekosten: assemblyCosts, zusatzkosten: Number(record?.additionalCosts) || 0, rabattProzent: Number(record?.discountPercent) || 0, rabattFest: Number(record?.discountFixed) || 0, mwstSatz: record?.vatRate ?? 19 })

  return <div className="space-y-7 sm:space-y-9">
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-sm font-bold text-orange">Kaufmännische Bearbeitung</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Kalkulation</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">Gespeicherte technische Aufmaßdaten übernehmen und kaufmännisch kalkulieren.</p></div>{record && <span className={`inline-flex min-h-10 w-fit items-center gap-2 rounded-full px-3 text-xs font-bold ${saveState === 'saving' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{saveState === 'saving' ? 'Wird gespeichert …' : <><Check size={14} /> Automatisch gespeichert</>}</span>}</section>

    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><label><span className="mb-2 block text-sm font-bold text-anthracite">Gespeichertes Aufmaß auswählen</span><select value={selectedId} onChange={(event) => choose(event.target.value)} className={inputClass}><option value="">Bitte Aufmaß auswählen</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.projectName || 'Unbenanntes Aufmaß'} · {item.customerName || 'Kein Kunde'} · {item.status}</option>)}</select></label>{projects.length === 0 && <p className="mt-3 text-sm text-neutral-500">Noch kein Aufmaß gespeichert. Bitte zuerst im Bereich „Aufmaß“ technische Daten erfassen.</p>}</section>

    {selected && record ? <>
      <section className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6 xl:grid-cols-4"><Info label="Projekt" value={selected.projectName} /><Info label="Kunde" value={selected.customerName} /><Info label="Adresse" value={selected.address} /><Info label="Aufmaß" value={`${selected.measureDate} · ${selected.employee || 'Kein Bearbeiter'}`} /></section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><div><h2 className="font-bold text-anthracite">Multiplikator auf alle Positionen anwenden</h2><p className="mt-1 text-xs text-neutral-500">Vorhandene individuelle Faktoren werden überschrieben.</p></div><div className="mt-4 flex flex-wrap gap-2">{factors.map((factor) => <button key={factor} type="button" onClick={() => setGlobalFactor(factor as FactorOption)} className={`min-h-10 rounded-xl px-4 text-sm font-bold ${globalFactor === factor ? 'bg-orange text-white' : 'bg-neutral-100 text-neutral-600'}`}>{factor === 'custom' ? 'Eigener Faktor' : `×${factor.replace('.', ',')}`}</button>)}</div>{globalFactor === 'custom' && <input type="number" min="0.01" value={globalCustom} onChange={(event) => (event.target.value === '' || Number(event.target.value) > 0) && setGlobalCustom(event.target.value)} placeholder="Faktor größer 0" className={`${inputClass} mt-3 max-w-xs`} />}<button type="button" onClick={applyToAll} disabled={globalFactor === 'custom' && Number(globalCustom) <= 0} className="mt-4 min-h-11 rounded-xl bg-anthracite px-4 text-sm font-bold text-white disabled:opacity-40">Auf alle Positionen anwenden</button></section>

      <section className="space-y-6">{selected.rooms.map((room, roomIndex) => { const pricePositions = room.elements.map((element) => measurementToPrice(element, getSetting(element.id))); const roomTotal = berechneAbschluss([pricePositions], { montagekosten: Number(record.roomAssembly[room.id]) || 0, zusatzkosten: 0, rabattProzent: 0, rabattFest: 0, mwstSatz: record.vatRate }); return <section key={room.id} className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm"><header className="grid gap-4 border-b border-neutral-200 bg-white p-4 sm:p-6 xl:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold text-orange">Raum {roomIndex + 1}</p><h2 className="text-xl font-bold text-anthracite">{room.name || 'Unbenannter Raum'}</h2><label className="mt-3 block max-w-xs"><span className="mb-1 block text-xs font-bold text-neutral-600">Montagekosten Raum (€)</span><input type="number" min="0" value={record.roomAssembly[room.id] ?? ''} onChange={(event) => (event.target.value === '' || Number(event.target.value) >= 0) && patchRecord({ roomAssembly: { ...record.roomAssembly, [room.id]: event.target.value } })} className={inputClass} /></label></div><div className="flex flex-wrap gap-4 text-sm"><b>{currency.format(roomTotal.einkaufGesamt)} Einkauf</b><b>{roomTotal.gueltig ? currency.format(roomTotal.nettosumme) : '—'} Verkauf</b><b>{currency.format(roomTotal.montagekosten)} Montage</b><b className="text-emerald-600">{roomTotal.gueltig ? currency.format(roomTotal.gewinnGesamt) : '—'} Gewinn</b></div></header><div className="space-y-4 p-3 sm:p-5">{room.elements.map((element) => <SavedElementCalculation key={element.id} element={element} setting={getSetting(element.id)} result={berechneElement(measurementToPrice(element, getSetting(element.id)))} onChange={(setting) => updateSetting(element.id, setting)} gross={record.priceDisplay === 'brutto'} vatRate={record.vatRate} />)}</div></section> })}</section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="font-bold text-anthracite">Allgemeine Kosten, Rabatt und Steuer</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MoneyInput label="Allgemeine Montagekosten (€)" value={record.generalAssembly} onChange={(generalAssembly) => patchRecord({ generalAssembly })} /><MoneyInput label="Sonstige Zusatzkosten (€)" value={record.additionalCosts} onChange={(additionalCosts) => patchRecord({ additionalCosts })} /><MoneyInput label="Rabatt (%)" value={record.discountPercent} onChange={(discountPercent) => patchRecord({ discountPercent })} max={100} /><MoneyInput label="Rabatt fest (€)" value={record.discountFixed} onChange={(discountFixed) => patchRecord({ discountFixed })} /><label><span className="mb-1.5 block text-xs font-bold text-neutral-600">Mehrwertsteuer</span><select value={record.vatRate} onChange={(event) => patchRecord({ vatRate: Number(event.target.value) as 19 | 7 | 0 })} className={inputClass}><option value={19}>19 %</option><option value={7}>7 %</option><option value={0}>0 %</option></select></label><label><span className="mb-1.5 block text-xs font-bold text-neutral-600">Preisanzeige</span><select value={record.priceDisplay} onChange={(event) => patchRecord({ priceDisplay: event.target.value as 'netto' | 'brutto' })} className={inputClass}><option value="netto">Preise netto anzeigen</option><option value="brutto">Preise brutto anzeigen</option></select></label></div></section>

      <section className="rounded-3xl bg-anthracite p-5 text-white shadow-xl sm:p-7"><p className="text-sm font-bold text-orange">Gesamtkalkulation</p><h2 className="mt-1 text-2xl font-bold">Gesamtübersicht</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Total label="Einkauf gesamt" value={currency.format(total.einkaufGesamt)} /><Total label="Verkauf vor Rabatt" value={total.gueltig ? currency.format(total.verkaufVorRabatt) : '—'} /><Total label="Rabatt" value={currency.format(total.rabattGesamt)} /><Total label="Zusatzkosten" value={currency.format(total.zusatzkosten)} /><Total label="Montagekosten" value={currency.format(total.montagekosten)} /><Total label="Nettosumme" value={currency.format(total.nettosumme)} /><Total label={`Mehrwertsteuer (${record.vatRate} %)`} value={currency.format(total.mwstBetrag)} /><Total label="Bruttosumme" value={currency.format(total.bruttosumme)} /><Total label="Gesamtgewinn" value={total.gueltig ? currency.format(total.gewinnGesamt) : '—'} highlight /></div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={finishCalculation} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-anthracite"><Check size={18} /> Kalkulation abschließen</button><button type="button" onClick={createOffer} disabled={!record.completed} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><FileText size={18} /> Angebot erstellen</button></div>{!record.completed && <p className="mt-2 text-xs text-neutral-400">Das Angebot wird nach Abschluss der Kalkulation aktiviert.</p>}</section>
    </> : <section className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center"><Save className="mx-auto text-neutral-300" size={32} /><h2 className="mt-4 font-bold text-anthracite">Aufmaß auswählen</h2><p className="mt-2 text-sm text-neutral-500">Danach werden alle technischen Daten automatisch und schreibgeschützt übernommen.</p></section>}
  </div>
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className="mt-1 text-sm font-semibold text-anthracite">{value || '—'}</p></div> }
function Total({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div className="rounded-2xl bg-white/7 p-4"><p className="text-xs text-neutral-400">{label}</p><p className={`mt-2 text-xl font-bold ${highlight && value !== '—' ? 'text-emerald-400' : ''}`}>{value}</p></div> }
function MoneyInput({ label, value, onChange, max }: { label: string; value: string; onChange: (value: string) => void; max?: number }) { return <label><span className="mb-1.5 block text-xs font-bold text-neutral-600">{label}</span><input type="number" min="0" max={max} step="0.01" value={value} onChange={(event) => (event.target.value === '' || (Number(event.target.value) >= 0 && (!max || Number(event.target.value) <= max))) && onChange(event.target.value)} className={inputClass} /></label> }
