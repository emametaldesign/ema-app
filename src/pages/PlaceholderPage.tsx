type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
}

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <>
      <section>
        <p className="text-sm font-bold text-orange">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-anthracite sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">{description}</p>
      </section>

      <section className="mt-7 grid min-h-80 place-items-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center shadow-sm sm:mt-9">
        <div className="max-w-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-orange-soft text-lg font-black text-orange">EMA</div>
          <h2 className="mt-5 text-lg font-bold text-anthracite">Seitenbereich vorbereitet</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">In diesem Schritt wurde ausschließlich die Seitenstruktur angelegt. Die fachlichen Funktionen folgen nach separater Freigabe.</p>
        </div>
      </section>
    </>
  )
}
