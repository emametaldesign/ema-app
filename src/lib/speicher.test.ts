import { beforeEach, describe, expect, it } from 'vitest'
import { deleteMeasurement, duplicateMeasurement, loadMeasurements, saveMeasurement, updateMeasurementStatus } from './aufmassSpeicher'
import { loadCalculation, loadCalculations, saveCalculation } from './kalkulationsSpeicher'
import { createCalculationRecord, createMeasurementProject } from '../types/project'

class MemoryStorage {
  private data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
  clear() { this.data.clear() }
}

const storage = new MemoryStorage()

describe('lokale EMA-Speicherung', () => {
  beforeEach(() => storage.clear())

  it('speichert und lädt ein Aufmaß mit normalisierten Positionen', () => {
    const project = createMeasurementProject()
    project.projectName = 'Terrasse Müller'
    project.rooms[0].elements[0].positionNumber = 99
    saveMeasurement(project, storage)
    const loaded = loadMeasurements(storage)
    expect(loaded).toHaveLength(1)
    expect(loaded[0].projectName).toBe('Terrasse Müller')
    expect(loaded[0].rooms[0].elements[0].positionNumber).toBe(1)
  })

  it('fängt ungültige gespeicherte Daten sicher ab', () => {
    storage.setItem('ema:aufmasse', '{ungültig')
    storage.setItem('ema:kalkulationen', JSON.stringify({ version: 999, items: [] }))
    expect(loadMeasurements(storage)).toEqual([])
    expect(loadCalculations(storage)).toEqual([])
  })

  it('dupliziert, aktualisiert den Status und löscht Aufmaße', () => {
    const source = saveMeasurement(createMeasurementProject(), storage)
    const duplicate = duplicateMeasurement(source.id, storage)
    expect(duplicate?.id).not.toBe(source.id)
    expect(updateMeasurementStatus(source.id, 'Kalkulation begonnen', storage)?.status).toBe('Kalkulation begonnen')
    deleteMeasurement(source.id, storage)
    expect(loadMeasurements(storage).map((item) => item.id)).toEqual([duplicate?.id])
  })

  it('speichert Kalkulationswerte getrennt über die gemeinsame Aufmaß-ID', () => {
    const project = saveMeasurement(createMeasurementProject(), storage)
    const calculation = createCalculationRecord(project.id)
    calculation.settings.element1 = { factor: '4', customFactor: '', surcharge: '12', deduction: '' }
    saveCalculation(calculation, storage)
    expect(loadCalculation(project.id, storage)?.settings.element1.factor).toBe('4')
  })
})
