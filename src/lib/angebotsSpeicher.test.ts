import { beforeEach, describe, expect, it } from 'vitest'
import { createOfferFromCalculation, loadOffers, nextOfferNumber } from './angebotsSpeicher'
import { createCalculationRecord, createCalculationSetting, createMeasurementProject } from '../types/project'

class MemoryStorage {
  private data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
  clear() { this.data.clear() }
}
const storage = new MemoryStorage()

describe('Angebotsspeicherung und Übergabe', () => {
  beforeEach(() => storage.clear())

  it('erzeugt fortlaufende Angebotsnummern', () => {
    const project = createMeasurementProject()
    project.rooms[0].elements[0].widthMm = '1000'
    project.rooms[0].elements[0].heightMm = '1000'
    const calculation = createCalculationRecord(project.id)
    calculation.settings[project.rooms[0].elements[0].id] = createCalculationSetting()
    createOfferFromCalculation(project, calculation, storage)
    expect(nextOfferNumber(storage, new Date().getFullYear())).toMatch(/-0002$/)
  })

  it('übergibt Kundendaten und Verkaufspreise ohne interne Werte', () => {
    const project = createMeasurementProject()
    project.customerName = 'Max Mustermann'
    project.projectName = 'Terrasse'
    project.rooms[0].name = 'Wohnzimmer'
    project.rooms[0].elements[0].widthMm = '1000'
    project.rooms[0].elements[0].heightMm = '2000'
    const calculation = createCalculationRecord(project.id)
    calculation.settings[project.rooms[0].elements[0].id] = createCalculationSetting()
    const offer = createOfferFromCalculation(project, calculation, storage)
    expect(offer.customer).toBe('Max Mustermann')
    expect(offer.positions[0].room).toBe('Wohnzimmer')
    expect(offer.positions[0].totalPrice).toBeGreaterThan(0)
    const customerData = JSON.stringify(loadOffers(storage))
    expect(customerData).not.toContain('einkauf')
    expect(customerData).not.toContain('gewinn')
    expect(customerData).not.toContain('factor')
    expect(customerData).not.toContain('surcharge')
  })
})
