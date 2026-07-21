export const PREISE_PRO_LAUFENDEM_METER = {
  'Fest-Rahmen Standard': 9,
  'Fest-Rahmen Pollengewebe': 10,
  Doppelflügel: 11.5,
  Schiebeanlage: 16.5,
  Honeycomb: 22.5,
  Blackout: 17.5,
  Economy: 16,
} as const

export const ZUSCHLAG_OHNE_SCHWELLE = 10

export type PreisPosition = {
  breiteCm: number
  hoeheCm: number
  stueckzahl: number
  form: string
  system: string
  ohneSchwelle: boolean
}

export type PositionsErgebnis = {
  gueltig: boolean
  preisProMeter: number
  laufendeMeterProElement: number
  laufendeMeterGesamt: number
  einkaufProElement: number
  einkaufGesamt: number
}

export type KalkulationsErgebnis = {
  gueltig: boolean
  laufendeMeterGesamt: number
  einkaufGesamt: number
  verkaufGesamt: number
  gewinnGesamt: number
}

export function rundeGeldbetrag(wert: number): number {
  return Math.round((wert + Number.EPSILON) * 100) / 100
}

export function ermittlePreisProMeter(form: string, system: string): number {
  if (form === 'Doppelflügel' || system === 'Double Sineklik') return PREISE_PRO_LAUFENDEM_METER.Doppelflügel
  if (form === 'Schiebeanlage' || system === 'Çift Gazor Plissee') return PREISE_PRO_LAUFENDEM_METER.Schiebeanlage

  return PREISE_PRO_LAUFENDEM_METER[system as keyof typeof PREISE_PRO_LAUFENDEM_METER] ?? 0
}

export function berechnePosition(position: PreisPosition): PositionsErgebnis {
  const gueltig = position.breiteCm > 0 && position.hoeheCm > 0 && Number.isInteger(position.stueckzahl) && position.stueckzahl > 0
  const preisProMeter = ermittlePreisProMeter(position.form, position.system)

  if (!gueltig || preisProMeter <= 0) {
    return { gueltig: false, preisProMeter, laufendeMeterProElement: 0, laufendeMeterGesamt: 0, einkaufProElement: 0, einkaufGesamt: 0 }
  }

  const laufendeMeterProElement = ((position.breiteCm + position.hoeheCm) * 2) / 100
  const einkaufProElement = rundeGeldbetrag(laufendeMeterProElement * preisProMeter + (position.ohneSchwelle ? ZUSCHLAG_OHNE_SCHWELLE : 0))

  return {
    gueltig: true,
    preisProMeter,
    laufendeMeterProElement,
    laufendeMeterGesamt: laufendeMeterProElement * position.stueckzahl,
    einkaufProElement,
    einkaufGesamt: rundeGeldbetrag(einkaufProElement * position.stueckzahl),
  }
}

export function berechneKalkulation(positionen: PreisPosition[], multiplikator: number): KalkulationsErgebnis {
  const ergebnisse = positionen.map(berechnePosition)
  const gueltig = ergebnisse.every((ergebnis) => ergebnis.gueltig) && multiplikator > 0 && Number.isFinite(multiplikator)
  const laufendeMeterGesamt = ergebnisse.reduce((summe, ergebnis) => summe + ergebnis.laufendeMeterGesamt, 0)
  const einkaufGesamt = rundeGeldbetrag(ergebnisse.reduce((summe, ergebnis) => summe + ergebnis.einkaufGesamt, 0))

  if (!gueltig) {
    return { gueltig: false, laufendeMeterGesamt, einkaufGesamt, verkaufGesamt: 0, gewinnGesamt: 0 }
  }

  const verkaufGesamt = rundeGeldbetrag(einkaufGesamt * multiplikator)
  return {
    gueltig: true,
    laufendeMeterGesamt,
    einkaufGesamt,
    verkaufGesamt,
    gewinnGesamt: rundeGeldbetrag(verkaufGesamt - einkaufGesamt),
  }
}
