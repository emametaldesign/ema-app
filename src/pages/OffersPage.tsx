import { useEffect, useState } from 'react'
import { Check, Copy, FileText, Printer, Save, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { createOfferFromCalculation, deleteOffer, duplicateOffer, loadOffers, saveOffer, updateOfferStatus } from '../lib/angebotsSpeicher'
import { loadCalculations } from '../lib/kalkulationsSpeicher'
import { loadMeasurements, saveMeasurement } from '../lib/aufmassSpeicher'
import { currency, inputClass } from '../features/calculation/constants'
import type { Offer, OfferStatus } from '../types/project'

export function OffersPage() {
  const [params, setParams] = useSearchParams()
  const [offers, setOffers] = useState(loadOffers)
  const [projects, setProjects] = useState(loadMeasurements)
  const requested = params.get('angebot') ?? ''
  const [selectedId, setSelectedId] = useState(() => offers.some((item) => item.id === requested) ? requested : '')
  const selected = offers.find((item) => item.id === selectedId)
  const calculations = loadCalculations()
  const calculatedProjects = projects.filter((project) => calculations.some((calculation) => calculation.measurementId === project.id && calculation.completed))

  const refresh = () => { setOffers(loadOffers()); setProjects(loadMeasurements()) }
  useEffect(() => {
    if (!selected) return
    const timer = window.setTimeout(() => { saveOffer(selected) }, 500)
    return () => window.clearTimeout(timer)
  }, [selected])

  const choose = (id: string) => { setSelectedId(id); setParams(id ? { angebot: id } : {}) }
  const patch = (value: Partial<Offer>) => setOffers((current) => current.map((item) => item.id === selectedId ? { ...item, ...value } : item))
  const createForProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    const calculation = calculations.find((item) => item.measurementId === projectId && item.completed)
    if (!project || !calculation) return
    const offer = createOfferFromCalculation(project, calculation)
    saveMeasurement({ ...project, status: 'Angebot erstellt' })
    refresh(); choose(offer.id)
  }
  const remove = (id: string) => { if (!window.confirm('Dieses Angebot wirklich löschen?')) return; deleteOffer(id); if (selectedId === id) choose(''); refresh() }
  const duplicate = (id: string) => { const copy = duplicateOffer(id); refresh(); if (copy) choose(copy.id) }
  const status = (value: OfferStatus) => { if (!selected) return; updateOfferStatus(selected.id, value); refresh() }

  return <div className="space-y-7 sm:space-y-9">
    <section><p className="text-sm font-bold text-orange">Kundenunterlagen</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Angebote</h1><p className="mt-3 text-sm text-neutral-500 sm:text-base">Kalkulierte Projekte in kundenfertige Angebote überführen.</p></section>

    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="font-bold text-anthracite">Gespeicherte kalkulierte Projekte</h2><div className="mt-4 space-y-2">{calculatedProjects.map((project) => <div key={project.id} className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div><b className="text-sm text-anthracite">{project.projectName || 'Unbenanntes Projekt'}</b><p className="text-xs text-neutral-500">{project.customerName || 'Kein Kunde'} · {project.status}</p></div><button type="button" onClick={() => createForProject(project.id)} className="min-h-10 rounded-xl bg-orange px-3 text-xs font-bold text-white">Neues Angebot erstellen</button></div>)}{calculatedProjects.length === 0 && <p className="text-sm text-neutral-500">Noch keine abgeschlossene Kalkulation vorhanden.</p>}</div></section>

    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="font-bold text-anthracite">Gespeicherte Angebote</h2><div className="mt-4 space-y-3">{offers.map((offer) => <article key={offer.id} className={`flex flex-col gap-3 rounded-xl border p-3 xl:flex-row xl:items-center xl:justify-between ${offer.id === selectedId ? 'border-orange bg-orange-soft/40' : 'border-neutral-200'}`}><div><b className="text-sm text-anthracite">{offer.offerNumber} · {offer.projectName}</b><p className="text-xs text-neutral-500">{offer.customer} · {offer.status} · {currency.format(offer.grossTotal)}</p></div><div className="flex flex-wrap gap-2"><Small label="Öffnen / bearbeiten" onClick={() => choose(offer.id)} /><Small label="Duplizieren" icon={Copy} onClick={() => duplicate(offer.id)} /><Small label="Löschen" icon={Trash2} danger onClick={() => remove(offer.id)} /></div></article>)}</div></section>

    {selected && <>
      <section className="no-print rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-anthracite">Angebot bearbeiten</h2><p className="text-xs text-neutral-500">Änderungen werden automatisch gespeichert.</p></div><div className="flex flex-wrap gap-2"><Small label="Speichern" icon={Save} onClick={() => { saveOffer(selected); refresh() }} /><Small label="Druckvorschau" icon={Printer} onClick={() => window.print()} /></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Text label="Betreff" value={selected.subject} onChange={(subject) => patch({ subject })} /><Text label="Einleitung" value={selected.introduction} onChange={(introduction) => patch({ introduction })} area /><Text label="Zahlungsbedingungen" value={selected.paymentTerms} onChange={(paymentTerms) => patch({ paymentTerms })} /><Text label="Lieferzeit" value={selected.deliveryTime} onChange={(deliveryTime) => patch({ deliveryTime })} /><Text label="Gültigkeitsdauer" value={selected.validity} onChange={(validity) => patch({ validity })} /><Text label="Schlussformulierung" value={selected.closing} onChange={(closing) => patch({ closing })} area /></div><div className="mt-5 flex flex-wrap gap-2"><StatusButton label="Als versendet markieren" onClick={() => status('Versendet')} /><StatusButton label="Als angenommen markieren" onClick={() => status('Angenommen')} /><StatusButton label="Als abgelehnt markieren" onClick={() => status('Abgelehnt')} /><StatusButton label="In Auftrag umwandeln" onClick={() => status('Auftrag')} /></div></section>

      <OfferPreview offer={selected} />
    </>}
  </div>
}

function OfferPreview({ offer }: { offer: Offer }) { return <section className="print-area mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-10"><header className="flex items-start justify-between border-b-2 border-anthracite pb-6"><div><div className="grid size-16 place-items-center rounded-xl bg-orange font-black text-white">LOGO</div><h2 className="mt-3 text-xl font-black text-anthracite">EMA Metal Design GbR</h2></div><div className="text-right"><p className="text-2xl font-black text-anthracite">ANGEBOT</p><p className="mt-2 text-sm font-bold">{offer.offerNumber}</p><p className="text-sm text-neutral-500">Datum: {new Date(offer.offerDate).toLocaleDateString('de-DE')}</p></div></header><div className="mt-7 grid gap-5 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase text-neutral-400">Kunde</p><p className="mt-1 font-bold">{offer.customer}</p><p className="whitespace-pre-line text-sm text-neutral-600">{offer.address}</p></div><div><p className="text-xs font-bold uppercase text-neutral-400">Projekt</p><p className="mt-1 font-bold">{offer.projectName}</p></div></div><h3 className="mt-7 text-xl font-bold">{offer.subject}</h3><p className="mt-3 whitespace-pre-line text-sm leading-6 text-neutral-600">{offer.introduction}</p><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-anthracite text-white"><tr>{['Pos.', 'Raum / Produkt', 'Maße', 'Menge', 'Einzelpreis', 'Gesamtpreis'].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-neutral-200">{offer.positions.map((position) => <tr key={position.id}><td className="px-3 py-3">{position.positionNumber}</td><td className="px-3 py-3"><b>{position.room} · {position.product}</b><p className="text-xs text-neutral-500">{position.system} · {position.profile} · {position.mesh} · {position.colorInside}/{position.colorOutside}</p></td><td className="px-3 py-3">{position.widthMm} × {position.heightMm} mm</td><td className="px-3 py-3">{position.quantity}</td><td className="px-3 py-3">{currency.format(position.unitPrice)}</td><td className="px-3 py-3 font-bold">{currency.format(position.totalPrice)}</td></tr>)}</tbody></table></div><div className="ml-auto mt-6 max-w-sm space-y-2 text-sm"><Sum label="Montagekosten" value={offer.assemblyCosts} /><Sum label="Zusatzkosten" value={offer.additionalCosts} /><Sum label="Rabatt" value={-offer.discount} /><Sum label="Nettosumme" value={offer.netTotal} bold /><Sum label={`Mehrwertsteuer (${offer.vatRate} %)`} value={offer.vatAmount} /><Sum label="Bruttosumme" value={offer.grossTotal} bold /></div><div className="mt-10 grid gap-5 text-sm sm:grid-cols-2"><p><b>Zahlungsbedingungen</b><br />{offer.paymentTerms}</p><p><b>Lieferzeit</b><br />{offer.deliveryTime}</p><p><b>Gültigkeitsdauer</b><br />{offer.validity}</p></div><p className="mt-8 text-sm">{offer.closing}</p><div className="mt-16 w-64 border-t border-neutral-400 pt-2 text-xs text-neutral-500">Ort, Datum, Unterschrift</div></section> }
function Sum({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) { return <div className={`flex justify-between gap-6 ${bold ? 'border-t border-neutral-300 pt-2 font-black' : ''}`}><span>{label}</span><span>{currency.format(value)}</span></div> }
function Text({ label, value, onChange, area = false }: { label: string; value: string; onChange: (value: string) => void; area?: boolean }) { return <label><span className="mb-1.5 block text-xs font-bold text-neutral-600">{label}</span>{area ? <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} py-3`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />}</label> }
function Small({ label, onClick, icon: Icon = FileText, danger = false }: { label: string; onClick: () => void; icon?: typeof FileText; danger?: boolean }) { return <button type="button" onClick={onClick} className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold ${danger ? 'border-red-200 text-red-600' : 'border-neutral-200 text-neutral-600'}`}><Icon size={14} />{label}</button> }
function StatusButton({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-neutral-100 px-3 text-xs font-bold text-neutral-700"><Check size={14} />{label}</button> }
