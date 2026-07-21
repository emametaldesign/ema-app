import type { CalculationRecord } from '../types/project'

const KEY = 'ema:kalkulationen'
export const CALCULATION_STORAGE_VERSION = 1
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
type Envelope = { version: number; items: CalculationRecord[] }

const isRecord = (value: unknown): value is CalculationRecord => {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<CalculationRecord>
  return typeof item.measurementId === 'string' && !!item.settings && typeof item.settings === 'object' && typeof item.updatedAt === 'string'
}

export function loadCalculations(storage: StorageLike = localStorage): CalculationRecord[] {
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Partial<Envelope>
    if (data.version !== CALCULATION_STORAGE_VERSION || !Array.isArray(data.items)) return []
    return data.items.filter(isRecord)
  } catch { return [] }
}

export function loadCalculation(measurementId: string, storage: StorageLike = localStorage) {
  return loadCalculations(storage).find((item) => item.measurementId === measurementId)
}

export function saveCalculation(record: CalculationRecord, storage: StorageLike = localStorage): CalculationRecord {
  const saved = { ...record, updatedAt: new Date().toISOString() }
  const items = loadCalculations(storage)
  const index = items.findIndex((item) => item.measurementId === saved.measurementId)
  if (index >= 0) items[index] = saved
  else items.unshift(saved)
  storage.setItem(KEY, JSON.stringify({ version: CALCULATION_STORAGE_VERSION, items } satisfies Envelope))
  return saved
}
