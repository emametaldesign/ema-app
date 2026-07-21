export const forms = ['Fenster', 'Balkontür', 'Doppelflügel', 'Schiebeanlage', 'Dachfenster', 'Kellerfenster', 'Rundbogen', 'Schräge', 'Dreieck', 'Sonderform']

export const profiles = [
  'Dünnprofil, 25 mm sichtbare Profilbreite und 18 mm Profiltiefe',
  'Dickprofil, 35 mm sichtbare Profilbreite und 18 mm Profiltiefe',
]

export const systems = [
  'Fest-Rahmen Standard',
  'Fest-Rahmen Pollengewebe',
  'Doppelflügel',
  'Schiebeanlage',
  'Wabenplissee (Honeycomb-Plissee)',
  'Verdunkelungsplissee',
  'Economy-Plissee',
]

export const colors = ['Weiß', 'Anthrazit', 'Schwarz', 'Silber', 'Braun', 'Sonderfarbe']
export const factors = ['2', '3', '4', '4.5', 'custom'] as const

export const inputClass = 'min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-anthracite outline-none transition placeholder:text-neutral-400 focus:border-orange focus:ring-3 focus:ring-orange/10'
export const labelClass = 'mb-1.5 block text-xs font-bold text-neutral-600'
export const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
export const meters = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
