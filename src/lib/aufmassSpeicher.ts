import type { MeasurementProject, ProjectStatus } from '../types/project'
import { normalizePositions } from '../types/project'

const KEY = 'ema:aufmasse'
export const AUFMASS_STORAGE_VERSION = 1
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
type Envelope = { version: number; items: MeasurementProject[] }

const isProject = (value: unknown): value is MeasurementProject => {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<MeasurementProject>
  return typeof item.id === 'string' && typeof item.projectName === 'string' && typeof item.customerName === 'string' && Array.isArray(item.rooms) && typeof item.createdAt === 'string' && typeof item.updatedAt === 'string'
}

export function loadMeasurements(storage: StorageLike = localStorage): MeasurementProject[] {
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Partial<Envelope>
    if (data.version !== AUFMASS_STORAGE_VERSION || !Array.isArray(data.items)) return []
    return data.items.filter(isProject)
  } catch { return [] }
}

function write(items: MeasurementProject[], storage: StorageLike) {
  storage.setItem(KEY, JSON.stringify({ version: AUFMASS_STORAGE_VERSION, items } satisfies Envelope))
}

export function saveMeasurement(project: MeasurementProject, storage: StorageLike = localStorage): MeasurementProject {
  const saved = normalizePositions({ ...project, updatedAt: new Date().toISOString() })
  const items = loadMeasurements(storage)
  const index = items.findIndex((item) => item.id === saved.id)
  if (index >= 0) items[index] = saved
  else items.unshift(saved)
  write(items, storage)
  return saved
}

export function deleteMeasurement(id: string, storage: StorageLike = localStorage) {
  write(loadMeasurements(storage).filter((item) => item.id !== id), storage)
}

export function updateMeasurementStatus(id: string, status: ProjectStatus, storage: StorageLike = localStorage): MeasurementProject | undefined {
  const project = loadMeasurements(storage).find((item) => item.id === id)
  return project ? saveMeasurement({ ...project, status }, storage) : undefined
}

export function duplicateMeasurement(id: string, storage: StorageLike = localStorage): MeasurementProject | undefined {
  const source = loadMeasurements(storage).find((item) => item.id === id)
  if (!source) return undefined
  const now = new Date().toISOString()
  return saveMeasurement({ ...structuredClone(source), id: crypto.randomUUID(), projectName: `${source.projectName || 'Aufmaß'} – Kopie`, status: 'Entwurf', createdAt: now, updatedAt: now }, storage)
}
