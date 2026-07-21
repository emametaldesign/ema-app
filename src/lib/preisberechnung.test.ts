import { describe, expect, it } from 'vitest'
import { berechneKalkulation, berechnePosition, ermittlePreisProMeter } from './preisberechnung'

describe('EMA-Preisberechnung', () => {
  it('berechnet einen Standardrahmen einschließlich Stückzahl', () => {
    const ergebnis = berechnePosition({ breiteCm: 100, hoeheCm: 200, stueckzahl: 2, form: 'Fenster', system: 'Fest-Rahmen Standard', ohneSchwelle: false })
    expect(ergebnis.laufendeMeterProElement).toBe(6)
    expect(ergebnis.einkaufProElement).toBe(54)
    expect(ergebnis.einkaufGesamt).toBe(108)
  })

  it('addiert den Schwellenzuschlag pro Element vor der Stückzahl', () => {
    const ergebnis = berechnePosition({ breiteCm: 100, hoeheCm: 100, stueckzahl: 3, form: 'Fenster', system: 'Fest-Rahmen Pollengewebe', ohneSchwelle: true })
    expect(ergebnis.einkaufProElement).toBe(50)
    expect(ergebnis.einkaufGesamt).toBe(150)
  })

  it('gibt der Form Doppelflügel Vorrang vor dem gewählten System', () => {
    expect(ermittlePreisProMeter('Doppelflügel', 'Fest-Rahmen Standard')).toBe(11.5)
  })

  it('berechnet Verkauf und Gewinn mit dem Multiplikator', () => {
    const ergebnis = berechneKalkulation([{ breiteCm: 100, hoeheCm: 200, stueckzahl: 1, form: 'Fenster', system: 'Fest-Rahmen Standard', ohneSchwelle: false }], 4.5)
    expect(ergebnis.einkaufGesamt).toBe(54)
    expect(ergebnis.verkaufGesamt).toBe(243)
    expect(ergebnis.gewinnGesamt).toBe(189)
  })

  it('weist Maße und Faktoren kleiner oder gleich null zurück', () => {
    expect(berechnePosition({ breiteCm: 0, hoeheCm: 100, stueckzahl: 1, form: 'Fenster', system: 'Fest-Rahmen Standard', ohneSchwelle: false }).gueltig).toBe(false)
    expect(berechneKalkulation([{ breiteCm: 100, hoeheCm: 100, stueckzahl: 1, form: 'Fenster', system: 'Economy', ohneSchwelle: false }], 0).gueltig).toBe(false)
  })
})
