import { Calculator, FileText, Gauge, Ruler, Settings, Users, X, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Brand } from './Brand'

type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  end?: boolean
}

const navigation: NavigationItem[] = [
  { label: 'Dashboard', path: '/', icon: Gauge, end: true },
  { label: 'Kunden', path: '/kunden', icon: Users },
  { label: 'Aufmaß', path: '/aufmass', icon: Ruler },
  { label: 'Kalkulation', path: '/kalkulation', icon: Calculator },
  { label: 'Angebote', path: '/angebote', icon: FileText },
  { label: 'Einstellungen', path: '/einstellungen', icon: Settings },
]

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Menü schließen"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,86vw)] flex-col bg-anthracite text-white shadow-2xl transition-transform duration-300 ease-out lg:w-72 lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-6">
          <Brand />
          <button type="button" onClick={onClose} aria-label="Menü schließen" className="grid size-10 place-items-center rounded-xl text-neutral-400 transition hover:bg-white/10 hover:text-white lg:hidden">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-7" aria-label="Hauptnavigation">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Mitarbeiterbereich</p>
          <div className="space-y-1.5">
            {navigation.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${
                    isActive ? 'bg-orange text-white shadow-lg shadow-orange/15' : 'text-neutral-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.9} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-5">
          <div className="rounded-xl bg-white/5 px-4 py-3.5">
            <p className="text-xs font-semibold text-neutral-200">EMA Metall Design GbR</p>
            <p className="mt-1 text-[11px] text-neutral-500">Interner Mitarbeiterbereich</p>
          </div>
        </div>
      </aside>
    </>
  )
}
