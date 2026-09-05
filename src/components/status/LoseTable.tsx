import type { DrawHistoryEntry, Participant } from '../../types'

interface LoseTableProps {
  entries: DrawHistoryEntry[]
  participantsById: Map<string, Participant>
  eliminateOnLose: boolean
}

export function LoseTable({ entries, participantsById, eliminateOnLose }: LoseTableProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">아직 꽝 결과가 없습니다.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-1 pr-2">회차</th>
            <th className="py-1 pr-2">참가자</th>
            <th className="py-1 pr-2">시각</th>
            {eliminateOnLose && <th className="py-1">상태</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const participant = participantsById.get(e.participantId)
            return (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="py-1 pr-2">{e.round}</td>
                <td className="py-1 pr-2">{e.participantName}</td>
                <td className="py-1 pr-2 text-slate-400">
                  {new Date(e.createdAt).toLocaleTimeString()}
                </td>
                {eliminateOnLose && (
                  <td className="py-1 text-slate-500">
                    {participant?.status === 'ELIMINATED' ? '탈락' : '유지'}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
