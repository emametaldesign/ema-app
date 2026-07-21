export const PROJECT_STATUSES = ['Entwurf', 'Aufmaß abgeschlossen', 'Kalkulation begonnen', 'Kalkuliert', 'Angebot erstellt'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
export type FactorOption = '2' | '3' | '4' | '4.5' | 'custom'

export type TechnicalElement = {
  id: string
  positionNumber: number
  type: string
  widthMm: string
  heightMm: string
  quantity: number
  profile: string
  system: string
  mesh: string
  pleatedBlind: string
  colorInside: string
  colorOutside: string
  noThreshold: boolean
  note: string
}

export type ProjectRoom = { id: string; name: string; elements: TechnicalElement[] }

export type MeasurementProject = {
  id: string
  projectName: string
  customerMode: string
  customerName: string
  address: string
  measureDate: string
  employee: string
  rooms: ProjectRoom[]
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

export type CalculationSetting = {
  factor: FactorOption
  customFactor: string
  surcharge: string
  deduction: string
}

export type CalculationRecord = {
  measurementId: string
  settings: Record<string, CalculationSetting>
  roomAssembly: Record<string, string>
  generalAssembly: string
  additionalCosts: string
  discountPercent: string
  discountFixed: string
  vatRate: 19 | 7 | 0
  priceDisplay: 'netto' | 'brutto'
  completed: boolean
  updatedAt: string
}

export type OfferStatus = 'Entwurf' | 'Versendet' | 'Angenommen' | 'Abgelehnt' | 'Auftrag'
export type OfferPosition = { id: string; positionNumber: number; room: string; product: string; widthMm: string; heightMm: string; quantity: number; system: string; profile: string; mesh: string; colorInside: string; colorOutside: string; unitPrice: number; totalPrice: number }
export type Offer = {
  id: string; offerNumber: string; projectId: string; calculationId: string; customer: string; address: string; projectName: string; offerDate: string
  positions: OfferPosition[]; assemblyCosts: number; additionalCosts: number; discount: number; netTotal: number; vatRate: number; vatAmount: number; grossTotal: number
  subject: string; introduction: string; paymentTerms: string; deliveryTime: string; validity: string; closing: string
  createdAt: string; updatedAt: string; status: OfferStatus
}

export const createTechnicalElement = (): TechnicalElement => ({
  id: crypto.randomUUID(), positionNumber: 1, type: 'Fenster', widthMm: '', heightMm: '', quantity: 1,
  profile: 'Dünnes Profil (25 mm sichtbar / 18 mm tief)', system: 'Fest-Rahmen Standard', mesh: 'Standard',
  pleatedBlind: 'Kein Plissee', colorInside: 'Weiß', colorOutside: 'Anthrazit', noThreshold: false, note: '',
})

export const createProjectRoom = (): ProjectRoom => ({ id: crypto.randomUUID(), name: '', elements: [createTechnicalElement()] })

export const createMeasurementProject = (): MeasurementProject => {
  const now = new Date().toISOString()
  return { id: crypto.randomUUID(), projectName: '', customerMode: '', customerName: '', address: '', measureDate: now.slice(0, 10), employee: '', rooms: [createProjectRoom()], status: 'Entwurf', createdAt: now, updatedAt: now }
}

export const createCalculationSetting = (): CalculationSetting => ({ factor: '3', customFactor: '', surcharge: '', deduction: '' })
export const createCalculationRecord = (measurementId: string): CalculationRecord => ({ measurementId, settings: {}, roomAssembly: {}, generalAssembly: '', additionalCosts: '', discountPercent: '', discountFixed: '', vatRate: 19, priceDisplay: 'netto', completed: false, updatedAt: '' })

export function normalizePositions(project: MeasurementProject): MeasurementProject {
  let position = 1
  return { ...project, rooms: project.rooms.map((room) => ({ ...room, elements: room.elements.map((element) => ({ ...element, positionNumber: position++ })) })) }
}
