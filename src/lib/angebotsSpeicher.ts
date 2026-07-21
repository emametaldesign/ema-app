import { berechneAbschluss, berechneElement } from './preisberechnung'
import { measurementToPrice } from '../features/calculation/measurementAdapter'
import type { CalculationRecord, MeasurementProject, Offer, OfferStatus } from '../types/project'
import { createCalculationSetting } from '../types/project'

const KEY = 'ema:angebote'
export const OFFER_STORAGE_VERSION = 1
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
type Envelope = { version: number; items: Offer[] }

const isOffer = (value: unknown): value is Offer => {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Offer>
  return typeof item.id === 'string' && typeof item.offerNumber === 'string' && typeof item.projectId === 'string' && Array.isArray(item.positions) && typeof item.netTotal === 'number'
}

export function loadOffers(storage: StorageLike = localStorage): Offer[] {
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Partial<Envelope>
    return data.version === OFFER_STORAGE_VERSION && Array.isArray(data.items) ? data.items.filter(isOffer) : []
  } catch { return [] }
}

export function nextOfferNumber(storage: StorageLike = localStorage, year = new Date().getFullYear()): string {
  const prefix = `EMA-${year}-`
  const highest = loadOffers(storage).map((item) => item.offerNumber).filter((number) => number.startsWith(prefix)).map((number) => Number(number.slice(prefix.length)) || 0).reduce((max, value) => Math.max(max, value), 0)
  return `${prefix}${String(highest + 1).padStart(4, '0')}`
}

export function saveOffer(offer: Offer, storage: StorageLike = localStorage): Offer {
  const saved = { ...offer, updatedAt: new Date().toISOString() }
  const items = loadOffers(storage)
  const index = items.findIndex((item) => item.id === saved.id)
  if (index >= 0) items[index] = saved
  else items.unshift(saved)
  storage.setItem(KEY, JSON.stringify({ version: OFFER_STORAGE_VERSION, items } satisfies Envelope))
  return saved
}

export function deleteOffer(id: string, storage: StorageLike = localStorage) { storage.setItem(KEY, JSON.stringify({ version: OFFER_STORAGE_VERSION, items: loadOffers(storage).filter((item) => item.id !== id) } satisfies Envelope)) }
export function updateOfferStatus(id: string, status: OfferStatus, storage: StorageLike = localStorage) { const offer = loadOffers(storage).find((item) => item.id === id); return offer ? saveOffer({ ...offer, status }, storage) : undefined }
export function duplicateOffer(id: string, storage: StorageLike = localStorage): Offer | undefined { const source = loadOffers(storage).find((item) => item.id === id); if (!source) return; const now = new Date().toISOString(); return saveOffer({ ...structuredClone(source), id: crypto.randomUUID(), offerNumber: nextOfferNumber(storage), status: 'Entwurf', createdAt: now, updatedAt: now }, storage) }

export function createOfferFromCalculation(project: MeasurementProject, calculation: CalculationRecord, storage: StorageLike = localStorage): Offer {
  const priceRooms = project.rooms.map((room) => room.elements.map((element) => measurementToPrice(element, calculation.settings[element.id] ?? createCalculationSetting())))
  const assemblyCosts = Object.values(calculation.roomAssembly).reduce((sum, value) => sum + (Number(value) || 0), 0) + (Number(calculation.generalAssembly) || 0)
  const total = berechneAbschluss(priceRooms, { montagekosten: assemblyCosts, zusatzkosten: Number(calculation.additionalCosts) || 0, rabattProzent: Number(calculation.discountPercent) || 0, rabattFest: Number(calculation.discountFixed) || 0, mwstSatz: calculation.vatRate })
  const now = new Date().toISOString()
  return saveOffer({
    id: crypto.randomUUID(), offerNumber: nextOfferNumber(storage), projectId: project.id, calculationId: calculation.measurementId, customer: project.customerName, address: project.address, projectName: project.projectName, offerDate: now.slice(0, 10),
    positions: project.rooms.flatMap((room) => room.elements.map((element) => { const result = berechneElement(measurementToPrice(element, calculation.settings[element.id] ?? createCalculationSetting())); return { id: crypto.randomUUID(), positionNumber: element.positionNumber, room: room.name, product: element.type, widthMm: element.widthMm, heightMm: element.heightMm, quantity: element.quantity, system: element.system, profile: element.profile, mesh: element.mesh, colorInside: element.colorInside, colorOutside: element.colorOutside, unitPrice: result.gueltig ? result.verkaufGesamt / element.quantity : 0, totalPrice: result.verkaufGesamt } })),
    assemblyCosts: total.montagekosten, additionalCosts: total.zusatzkosten, discount: total.rabattGesamt, netTotal: total.nettosumme, vatRate: calculation.vatRate, vatAmount: total.mwstBetrag, grossTotal: total.bruttosumme,
    subject: 'Angebot für maßgefertigten Insektenschutz', introduction: 'Vielen Dank für Ihre Anfrage. Gerne bieten wir Ihnen folgende Leistungen an:', paymentTerms: 'Zahlbar nach Vereinbarung.', deliveryTime: 'Nach Vereinbarung.', validity: 'Dieses Angebot ist 14 Tage gültig.', closing: 'Wir freuen uns auf Ihren Auftrag.', createdAt: now, updatedAt: now, status: 'Entwurf',
  }, storage)
}
