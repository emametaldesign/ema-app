import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { Brand } from './Brand'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-neutral-100">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur-xl sm:h-[72px] sm:px-6 lg:px-10">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Menü öffnen" aria-expanded={menuOpen} className="mr-3 grid size-11 place-items-center rounded-xl text-anthracite transition hover:bg-neutral-100 lg:hidden">
            <Menu size={23} />
          </button>

          <div className="flex items-center gap-3 lg:hidden">
            <Brand compact />
            <span className="hidden text-sm font-bold text-anthracite sm:inline">EMA Metal Design</span>
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-bold text-anthracite">EMA Metal Design</p>
            <p className="text-xs text-neutral-500">Mitarbeiterbereich</p>
          </div>

          <div className="ml-auto flex items-center gap-3 border-l border-neutral-200 pl-4 sm:pl-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-anthracite">EMA Team</p>
              <p className="mt-0.5 text-xs text-neutral-500">Mitarbeiter</p>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-anthracite text-xs font-bold text-white ring-2 ring-orange/20">ET</div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
