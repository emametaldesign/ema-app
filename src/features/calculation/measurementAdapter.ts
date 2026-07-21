import type { PreisPositionMitMultiplikator } from '../../lib/preisberechnung'
import type { CalculationSetting, TechnicalElement } from '../../types/project'

export function measurementToPrice(element: TechnicalElement, setting: CalculationSetting): PreisPositionMitMultiplikator {
  return {
    breiteCm: Number(element.widthMm) / 10,
    hoeheCm: Number(element.heightMm) / 10,
    stueckzahl: element.quantity,
    form: element.type,
    system: element.system,
    ohneSchwelle: element.noThreshold,
    multiplikator: setting.factor === 'custom' ? Number(setting.customFactor) : Number(setting.factor),
    zusatzZuschlag: Number(setting.surcharge) || 0,
    zusatzAbschlag: Number(setting.deduction) || 0,
  }
}
