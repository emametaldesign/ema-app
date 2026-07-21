export const PREISE_PRO_LAUFENDEM_METER = {
  'Fest-Rahmen Standard': 9,
  'Fest-Rahmen Pollengewebe': 10,
  Doppelflügel: 11.5,
  Schiebeanlage: 16.5,
  Honeycomb: 22.5,
  Blackout: 17.5,
  Economy: 16,
  'Wabenplissee (Honeycomb-Plissee)': 22.5,
  Verdunkelungsplissee: 17.5,
  'Economy-Plissee': 16,
} as const

export const ZUSCHLAG_OHNE_SCHWELLE = 10

export type PreisPosition = {
  breiteCm: number
  hoeheCm: number
  stueckzahl: number
  form: string
  system: string
  ohneSchwelle: boolean
  zusatzZuschlag?: number
  zusatzAbschlag?: number
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

export type PreisPositionMitMultiplikator = PreisPosition & {
  multiplikator: number
}

export type ElementErgebnis = PositionsErgebnis & {
  verkaufGesamt: number
  gewinnGesamt: number
}

export type SummenErgebnis = KalkulationsErgebnis & {
  anzahlElemente: number
}

export type GesamtErgebnis = SummenErgebnis & {
  anzahlRaeume: number
}

export type AbschlussOptionen = { montagekosten: number; zusatzkosten: number; rabattProzent: number; rabattFest: number; mwstSatz: 19 | 7 | 0 }
export type AbschlussErgebnis = GesamtErgebnis & { verkaufVorRabatt: number; rabattGesamt: number; montagekosten: number; zusatzkosten: number; nettosumme: number; mwstBetrag: number; bruttosumme: number }

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
  const zusatzZuschlag = position.zusatzZuschlag && position.zusatzZuschlag > 0 ? position.zusatzZuschlag : 0
  const zusatzAbschlag = position.zusatzAbschlag && position.zusatzAbschlag > 0 ? position.zusatzAbschlag : 0
  const einkaufProElement = rundeGeldbetrag(Math.max(0, laufendeMeterProElement * preisProMeter + (position.ohneSchwelle ? ZUSCHLAG_OHNE_SCHWELLE : 0) + zusatzZuschlag - zusatzAbschlag))

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

export function berechneElement(position: PreisPositionMitMultiplikator): ElementErgebnis {
  const basis = berechnePosition(position)
  const faktorGueltig = position.multiplikator > 0 && Number.isFinite(position.multiplikator)

  if (!basis.gueltig || !faktorGueltig) {
    return { ...basis, gueltig: false, verkaufGesamt: 0, gewinnGesamt: 0 }
  }

  const verkaufGesamt = rundeGeldbetrag(basis.einkaufGesamt * position.multiplikator)
  return {
    ...basis,
    verkaufGesamt,
    gewinnGesamt: rundeGeldbetrag(verkaufGesamt - basis.einkaufGesamt),
  }
}

export function berechneRaum(positionen: PreisPositionMitMultiplikator[]): SummenErgebnis {
  const ergebnisse = positionen.map(berechneElement)
  const einkaufGesamt = rundeGeldbetrag(ergebnisse.reduce((summe, ergebnis) => summe + ergebnis.einkaufGesamt, 0))
  const verkaufGesamt = rundeGeldbetrag(ergebnisse.reduce((summe, ergebnis) => summe + ergebnis.verkaufGesamt, 0))

  return {
    gueltig: ergebnisse.every((ergebnis) => ergebnis.gueltig),
    anzahlElemente: positionen.length,
    laufendeMeterGesamt: ergebnisse.reduce((summe, ergebnis) => summe + ergebnis.laufendeMeterGesamt, 0),
    einkaufGesamt,
    verkaufGesamt,
    gewinnGesamt: rundeGeldbetrag(verkaufGesamt - einkaufGesamt),
  }
}

export function berechneGesamt(raeume: PreisPositionMitMultiplikator[][]): GesamtErgebnis {
  const raumErgebnisse = raeume.map(berechneRaum)
  const einkaufGesamt = rundeGeldbetrag(raumErgebnisse.reduce((summe, ergebnis) => summe + ergebnis.einkaufGesamt, 0))
  const verkaufGesamt = rundeGeldbetrag(raumErgebnisse.reduce((summe, ergebnis) => summe + ergebnis.verkaufGesamt, 0))

  return {
    gueltig: raumErgebnisse.every((ergebnis) => ergebnis.gueltig),
    anzahlRaeume: raeume.length,
    anzahlElemente: raumErgebnisse.reduce((summe, ergebnis) => summe + ergebnis.anzahlElemente, 0),
    laufendeMeterGesamt: raumErgebnisse.reduce((summe, ergebnis) => summe + ergebnis.laufendeMeterGesamt, 0),
    einkaufGesamt,
    verkaufGesamt,
    gewinnGesamt: rundeGeldbetrag(verkaufGesamt - einkaufGesamt),
  }
}

export function berechneAbschluss(raeume: PreisPositionMitMultiplikator[][], optionen: AbschlussOptionen): AbschlussErgebnis {
  const basis = berechneGesamt(raeume)
  const montagekosten = Math.max(0, optionen.montagekosten || 0)
  const zusatzkosten = Math.max(0, optionen.zusatzkosten || 0)
  const verkaufVorRabatt = rundeGeldbetrag(basis.verkaufGesamt + montagekosten + zusatzkosten)
  const prozentRabatt = verkaufVorRabatt * Math.min(100, Math.max(0, optionen.rabattProzent || 0)) / 100
  const rabattGesamt = rundeGeldbetrag(Math.min(verkaufVorRabatt, prozentRabatt + Math.max(0, optionen.rabattFest || 0)))
  const nettosumme = rundeGeldbetrag(verkaufVorRabatt - rabattGesamt)
  const mwstBetrag = rundeGeldbetrag(nettosumme * optionen.mwstSatz / 100)
  return { ...basis, verkaufVorRabatt, rabattGesamt, montagekosten, zusatzkosten, nettosumme, mwstBetrag, bruttosumme: rundeGeldbetrag(nettosumme + mwstBetrag), gewinnGesamt: rundeGeldbetrag(nettosumme - basis.einkaufGesamt) }
}
