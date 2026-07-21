import { useEffect, useState } from 'react'
import { Check, FileText, Save } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { berechneElement, berechneGesamt, berechneRaum } from '../lib/preisberechnung'
import { loadMeasurements, saveMeasurement } from '../lib/aufmassSpeicher'
import { loadCalculation, saveCalculation } from '../lib/kalkulationsSpeicher'
import { currency, factors, inputClass, meters } from '../features/calculation/constants'
import { measurementToPrice } from '../features/calculation/measurementAdapter'
import { SavedElementCalculation } from '../features/calculation/SavedElementCalculation'
import { createCalculationSetting, type CalculationRecord, type CalculationSetting, type FactorOption, type MeasurementProject } from '../types/project'

function createRecord(project: MeasurementProject): CalculationRecord {
  const existing = loadCalculation(project.id)
  const settings = { ...(existing?.settings ?? {}) }
  project.rooms.flatMap((room) => room.elements).forEach((element) => { settings[element.id] ??= createCalculationSetting() })
  return { measurementId: project.id, settings, updatedAt: existing?.updatedAt ?? '' }
}

export function CalculationPage() {
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
  const applyToAll = () => {
    if (!record || !selected || (globalFactor === 'custom' && Number(globalCustom) <= 0)) return
    const settings = { ...record.settings }
    selected.rooms.flatMap((room) => room.elements).forEach((element) => { settings[element.id] = { ...getSetting(element.id), factor: globalFactor, customFactor: globalFactor === 'custom' ? globalCustom : '' } })
    setRecord({ ...record, settings })
  }
  const finishCalculation = () => {
    if (!record || !selected) return
    saveCalculation(record)
    saveMeasurement({ ...selected, status: 'Kalkuliert' })
    setProjects(loadMeasurements())
    window.alert('Die Kalkulation wurde gespeichert und als „Kalkuliert“ markiert. Die Angebotsseite wird in einem späteren Schritt verbunden.')
  }

  const allPriceRooms = selected?.rooms.map((room) => room.elements.map((element) => measurementToPrice(element, getSetting(element.id)))) ?? []
  const total = berechneGesamt(allPriceRooms)

  return <div className="space-y-7 sm:space-y-9">
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-sm font-bold text-orange">Kaufmännische Bearbeitung</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Kalkulation</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">Gespeicherte technische Aufmaßdaten übernehmen und kaufmännisch kalkulieren.</p></div>{record && <span className={`inline-flex min-h-10 w-fit items-center gap-2 rounded-full px-3 text-xs font-bold ${saveState === 'saving' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{saveState === 'saving' ? 'Wird gespeichert …' : <><Check size={14} /> Automatisch gespeichert</>}</span>}</section>

    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><label><span className="mb-2 block text-sm font-bold text-anthracite">Gespeichertes Aufmaß auswählen</span><select value={selectedId} onChange={(event) => choose(event.target.value)} className={inputClass}><option value="">Bitte Aufmaß auswählen</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.projectName || 'Unbenanntes Aufmaß'} · {item.customerName || 'Kein Kunde'} · {item.status}</option>)}</select></label>{projects.length === 0 && <p className="mt-3 text-sm text-neutral-500">Noch kein Aufmaß gespeichert. Bitte zuerst im Bereich „Aufmaß“ technische Daten erfassen.</p>}</section>

    {selected && record ? <>
      <section className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6 xl:grid-cols-4"><Info label="Projekt" value={selected.projectName} /><Info label="Kunde" value={selected.customerName} /><Info label="Adresse" value={selected.address} /><Info label="Aufmaß" value={`${selected.measureDate} · ${selected.employee || 'Kein Bearbeiter'}`} /></section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><div><h2 className="font-bold text-anthracite">Multiplikator auf alle Positionen anwenden</h2><p className="mt-1 text-xs text-neutral-500">Vorhandene individuelle Faktoren werden überschrieben.</p></div><div className="mt-4 flex flex-wrap gap-2">{factors.map((factor) => <button key={factor} type="button" onClick={() => setGlobalFactor(factor as FactorOption)} className={`min-h-10 rounded-xl px-4 text-sm font-bold ${globalFactor === factor ? 'bg-orange text-white' : 'bg-neutral-100 text-neutral-600'}`}>{factor === 'custom' ? 'Eigener Faktor' : `×${factor.replace('.', ',')}`}</button>)}</div>{globalFactor === 'custom' && <input type="number" min="0.01" value={globalCustom} onChange={(event) => (event.target.value === '' || Number(event.target.value) > 0) && setGlobalCustom(event.target.value)} placeholder="Faktor größer 0" className={`${inputClass} mt-3 max-w-xs`} />}<button type="button" onClick={applyToAll} disabled={globalFactor === 'custom' && Number(globalCustom) <= 0} className="mt-4 min-h-11 rounded-xl bg-anthracite px-4 text-sm font-bold text-white disabled:opacity-40">Auf alle Positionen anwenden</button></section>

      <section className="space-y-6">{selected.rooms.map((room, roomIndex) => { const pricePositions = room.elements.map((element) => measurementToPrice(element, getSetting(element.id))); const roomTotal = berechneRaum(pricePositions); return <section key={room.id} className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm"><header className="flex flex-col gap-3 border-b border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-xs font-bold text-orange">Raum {roomIndex + 1}</p><h2 className="text-xl font-bold text-anthracite">{room.name || 'Unbenannter Raum'}</h2></div><div className="flex flex-wrap gap-4 text-sm"><b>{currency.format(roomTotal.einkaufGesamt)} Einkauf</b><b>{roomTotal.gueltig ? currency.format(roomTotal.verkaufGesamt) : '—'} Verkauf</b><b className="text-emerald-600">{roomTotal.gueltig ? currency.format(roomTotal.gewinnGesamt) : '—'} Gewinn</b></div></header><div className="space-y-4 p-3 sm:p-5">{room.elements.map((element) => <SavedElementCalculation key={element.id} element={element} setting={getSetting(element.id)} result={berechneElement(measurementToPrice(element, getSetting(element.id)))} onChange={(setting) => updateSetting(element.id, setting)} />)}</div></section> })}</section>

      <section className="rounded-3xl bg-anthracite p-5 text-white shadow-xl sm:p-7"><p className="text-sm font-bold text-orange">Gesamtkalkulation</p><h2 className="mt-1 text-2xl font-bold">Gesamtübersicht</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Total label="Laufende Meter" value={`${meters.format(total.laufendeMeterGesamt)} m`} /><Total label="Einkauf gesamt" value={currency.format(total.einkaufGesamt)} /><Total label="Verkauf gesamt" value={total.gueltig ? currency.format(total.verkaufGesamt) : '—'} /><Total label="Gesamtgewinn" value={total.gueltig ? currency.format(total.gewinnGesamt) : '—'} highlight /></div><button type="button" onClick={finishCalculation} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-bold text-white"><FileText size={18} /> Angebot erstellen</button><p className="mt-2 text-xs text-neutral-400">Speichert die Kalkulation; die Angebotsdarstellung folgt später.</p></section>
    </> : <section className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center"><Save className="mx-auto text-neutral-300" size={32} /><h2 className="mt-4 font-bold text-anthracite">Aufmaß auswählen</h2><p className="mt-2 text-sm text-neutral-500">Danach werden alle technischen Daten automatisch und schreibgeschützt übernommen.</p></section>}
  </div>
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className="mt-1 text-sm font-semibold text-anthracite">{value || '—'}</p></div> }
function Total({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div className="rounded-2xl bg-white/7 p-4"><p className="text-xs text-neutral-400">{label}</p><p className={`mt-2 text-xl font-bold ${highlight && value !== '—' ? 'text-emerald-400' : ''}`}>{value}</p></div> }
