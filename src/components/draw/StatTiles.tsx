interface StatTilesProps {
  remainingParticipants: number
  remainingPrizes: number
  completedRounds: number
}

export function StatTiles({ remainingParticipants, remainingPrizes, completedRounds }: StatTilesProps) {
  const tiles: [string, number][] = [
    ['남은 참가자', remainingParticipants],
    ['남은 경품', remainingPrizes],
    ['진행 라운드', completedRounds],
  ]

  return (
    <div className="grid w-full grid-cols-3 divide-x divide-slate-200 rounded border border-slate-200 bg-white">
      {tiles.map(([label, value]) => (
        <div key={label} className="px-2 py-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  )
}
