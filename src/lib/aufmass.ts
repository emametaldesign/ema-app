export type MassErgebnis = {
  gueltig: boolean
  umfangMm: number
  flaecheMm2: number
  flaecheM2: number
}

export function berechneMasse(breiteMm: number, hoeheMm: number): MassErgebnis {
  const gueltig = breiteMm > 0 && hoeheMm > 0 && Number.isFinite(breiteMm) && Number.isFinite(hoeheMm)
  if (!gueltig) return { gueltig: false, umfangMm: 0, flaecheMm2: 0, flaecheM2: 0 }

  const flaecheMm2 = breiteMm * hoeheMm
  return {
    gueltig: true,
    umfangMm: (breiteMm + hoeheMm) * 2,
    flaecheMm2,
    flaecheM2: flaecheMm2 / 1_000_000,
  }
}
