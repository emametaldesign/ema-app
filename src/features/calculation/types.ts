export type FactorOption = '2' | '3' | '4' | '4.5' | 'custom'

export type MeasurementElement = {
  id: string
  name: string
  form: string
  width: string
  height: string
  quantity: number
  profile: string
  colorInside: string
  colorOutside: string
  system: string
  noThreshold: boolean
  factor: FactorOption
  customFactor: string
  note: string
}

export type Room = {
  id: string
  name: string
  note: string
  elements: MeasurementElement[]
}

export type CustomerData = {
  selection: string
  name: string
  phone: string
  address: string
  measureDate: string
  note: string
}

export const emptyCustomer = (): CustomerData => ({ selection: '', name: '', phone: '', address: '', measureDate: '', note: '' })

export const createElement = (): MeasurementElement => ({
  id: crypto.randomUUID(),
  name: '',
  form: 'Fenster',
  width: '',
  height: '',
  quantity: 1,
  profile: 'Dünnprofil, 25 mm sichtbare Profilbreite und 18 mm Profiltiefe',
  colorInside: 'Weiß',
  colorOutside: 'Anthrazit',
  system: 'Fest-Rahmen Standard',
  noThreshold: false,
  factor: '3',
  customFactor: '',
  note: '',
})

export const createRoom = (): Room => ({ id: crypto.randomUUID(), name: '', note: '', elements: [createElement()] })
