import { describe, expect, it } from 'vitest'
import { berechneAbschluss, berechneGesamt, berechneKalkulation, berechnePosition, berechneRaum, ermittlePreisProMeter } from './preisberechnung'

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

  it('summiert Elemente mit individuellen Multiplikatoren pro Raum', () => {
    const raum = berechneRaum([
      { breiteCm: 100, hoeheCm: 100, stueckzahl: 1, form: 'Fenster', system: 'Fest-Rahmen Standard', ohneSchwelle: false, multiplikator: 2 },
      { breiteCm: 100, hoeheCm: 100, stueckzahl: 1, form: 'Fenster', system: 'Economy-Plissee', ohneSchwelle: false, multiplikator: 3 },
    ])
    expect(raum.anzahlElemente).toBe(2)
    expect(raum.einkaufGesamt).toBe(100)
    expect(raum.verkaufGesamt).toBe(264)
    expect(raum.gewinnGesamt).toBe(164)
  })

  it('summiert Räume und Elemente in der Gesamtübersicht', () => {
    const position = { breiteCm: 100, hoeheCm: 100, stueckzahl: 1, form: 'Fenster', system: 'Fest-Rahmen Standard', ohneSchwelle: false, multiplikator: 2 }
    const gesamt = berechneGesamt([[position], [position, position]])
    expect(gesamt.anzahlRaeume).toBe(2)
    expect(gesamt.anzahlElemente).toBe(3)
    expect(gesamt.laufendeMeterGesamt).toBe(12)
    expect(gesamt.einkaufGesamt).toBe(108)
    expect(gesamt.verkaufGesamt).toBe(216)
  })

  it('berechnet Rabatt, Netto, Steuer und Brutto zentral', () => {
    const position = { breiteCm: 100, hoeheCm: 100, stueckzahl: 1, form: 'Fenster', system: 'Fest-Rahmen Standard', ohneSchwelle: false, multiplikator: 2 }
    const result = berechneAbschluss([[position]], { montagekosten: 20, zusatzkosten: 10, rabattProzent: 10, rabattFest: 2, mwstSatz: 19 })
    expect(result.verkaufVorRabatt).toBe(102)
    expect(result.rabattGesamt).toBe(12.2)
    expect(result.nettosumme).toBe(89.8)
    expect(result.mwstBetrag).toBe(17.06)
    expect(result.bruttosumme).toBe(106.86)
  })
})
