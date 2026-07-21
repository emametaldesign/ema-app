export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange text-sm font-black tracking-tight text-white shadow-lg shadow-orange/20">
        EMA
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-bold tracking-tight text-white">Metal Design</p>
          <p className="mt-0.5 text-[11px] font-medium tracking-wide text-neutral-400">Handwerk. Präzision. Design.</p>
        </div>
      )}
    </div>
  )
}
