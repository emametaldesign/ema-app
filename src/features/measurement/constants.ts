export const elementTypes = ['Fenster', 'Balkontür', 'Doppelflügel', 'Schiebeanlage', 'Dachfenster', 'Tür']
export const profiles = ['Dünnes Profil (25 mm sichtbar / 18 mm tief)', 'Dickes Profil (35 mm sichtbar / 18 mm tief)']
export const meshes = ['Standard', 'Pollenschutz', 'Edelstahl', 'Petscreen']
export const pleatedBlinds = ['Kein Plissee', 'Standardplissee', 'Wabenplissee (Honey Comb)']
export const colors = ['Weiß', 'Anthrazit', 'Schwarz', 'Silber', 'Braun', 'Sonderfarbe']
export const factors = ['2', '3', '4', '4.5', 'custom'] as const
export const inputClass = 'min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-anthracite outline-none transition placeholder:text-neutral-400 focus:border-orange focus:ring-3 focus:ring-orange/10'
export const number = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })
