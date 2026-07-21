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
}

export type CalculationRecord = {
  measurementId: string
  settings: Record<string, CalculationSetting>
  updatedAt: string
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

export const createCalculationSetting = (): CalculationSetting => ({ factor: '3', customFactor: '', surcharge: '' })

export function normalizePositions(project: MeasurementProject): MeasurementProject {
  let position = 1
  return { ...project, rooms: project.rooms.map((room) => ({ ...room, elements: room.elements.map((element) => ({ ...element, positionNumber: position++ })) })) }
}
