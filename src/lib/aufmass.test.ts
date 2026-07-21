import { describe, expect, it } from 'vitest'
import { berechneMasse } from './aufmass'

describe('Aufmaßberechnung', () => {
  it('berechnet Umfang in Millimetern', () => {
    expect(berechneMasse(1_000, 2_000).umfangMm).toBe(6_000)
  })

  it('berechnet Fläche in Quadratmillimetern und Quadratmetern', () => {
    const ergebnis = berechneMasse(1_000, 2_000)
    expect(ergebnis.flaecheMm2).toBe(2_000_000)
    expect(ergebnis.flaecheM2).toBe(2)
  })

  it('weist nicht positive Maße zurück', () => {
    expect(berechneMasse(0, 1_000).gueltig).toBe(false)
    expect(berechneMasse(-1, 1_000).gueltig).toBe(false)
  })
})
