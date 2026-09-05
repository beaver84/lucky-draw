interface DrawHeaderProps {
  round: number
  participantName: string | null
}

export function DrawHeader({ round, participantName }: DrawHeaderProps) {
  return (
    <div className="flex w-full items-baseline gap-3 border-b border-slate-200 pb-3">
      <span className="text-sm text-slate-400">라운드 {round}</span>
      <span className="text-lg font-bold text-slate-800">
        현재 참가자 <span className="text-indigo-600">{participantName ?? '???'}</span>
      </span>
    </div>
  )
}
