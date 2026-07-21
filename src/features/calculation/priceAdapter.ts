import type { PreisPositionMitMultiplikator } from '../../lib/preisberechnung'
import type { MeasurementElement } from './types'

export function toPricePosition(element: MeasurementElement): PreisPositionMitMultiplikator {
  return {
    breiteCm: Number(element.width),
    hoeheCm: Number(element.height),
    stueckzahl: element.quantity,
    form: element.form,
    system: element.system,
    ohneSchwelle: element.noThreshold,
    multiplikator: element.factor === 'custom' ? Number(element.customFactor) : Number(element.factor),
  }
}
