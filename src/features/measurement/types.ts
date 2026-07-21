export type MeasurementFactor = '2' | '3' | '4' | '4.5' | 'custom'

export type MeasurementEntry = {
  id: string
  type: string
  widthMm: string
  heightMm: string
  quantity: number
  profile: string
  mesh: string
  pleatedBlind: string
  colorInside: string
  colorOutside: string
  factor: MeasurementFactor
  customFactor: string
  note: string
}

export type MeasurementRoom = {
  id: string
  name: string
  elements: MeasurementEntry[]
}

export type MeasurementProject = {
  projectName: string
  customerMode: string
  customerName: string
  address: string
  date: string
  employee: string
  rooms: MeasurementRoom[]
}

export const createMeasurementEntry = (): MeasurementEntry => ({
  id: crypto.randomUUID(),
  type: 'Fenster',
  widthMm: '',
  heightMm: '',
  quantity: 1,
  profile: 'Dünnes Profil (25 mm sichtbar / 18 mm tief)',
  mesh: 'Standard',
  pleatedBlind: 'Kein Plissee',
  colorInside: 'Weiß',
  colorOutside: 'Anthrazit',
  factor: '3',
  customFactor: '',
  note: '',
})

export const createMeasurementRoom = (): MeasurementRoom => ({ id: crypto.randomUUID(), name: '', elements: [createMeasurementEntry()] })

export const createMeasurementProject = (): MeasurementProject => ({
  projectName: '',
  customerMode: '',
  customerName: '',
  address: '',
  date: new Date().toISOString().slice(0, 10),
  employee: '',
  rooms: [createMeasurementRoom()],
})
