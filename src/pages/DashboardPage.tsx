import { CalendarDays, FileText, Gauge, UserRoundPlus, type LucideIcon } from 'lucide-react'

type DashboardCard = {
  title: string
  description: string
  icon: LucideIcon
}

const dashboardCards: DashboardCard[] = [
  { title: 'Heute', description: 'Termine und Aufgaben für den heutigen Tag.', icon: CalendarDays },
  { title: 'Offene Angebote', description: 'Noch nicht abgeschlossene Angebote im Überblick.', icon: FileText },
  { title: 'Neue Kunden', description: 'Zuletzt hinzugefügte Kunden und Kontakte.', icon: UserRoundPlus },
  { title: 'Letzte Aktivitäten', description: 'Die zuletzt bearbeiteten Vorgänge der EMA-App.', icon: Gauge },
]

export function DashboardPage() {
  return (
    <>
      <section>
        <p className="text-sm font-bold text-orange">Übersicht</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">Willkommen im zentralen Arbeitsbereich von EMA Metal Design.</p>
      </section>

      <section className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard-Übersicht">
        {dashboardCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="group min-h-48 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange/30 hover:shadow-lg sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="grid size-11 place-items-center rounded-xl bg-orange-soft text-orange transition group-hover:bg-orange group-hover:text-white"><Icon size={21} strokeWidth={1.9} /></div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-500">Platzhalter</span>
            </div>
            <h2 className="mt-6 text-lg font-bold tracking-tight text-anthracite">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
          </article>
        ))}
      </section>
    </>
  )
}
