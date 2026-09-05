import type { DrawHistoryEntry } from '../../types'

export function WinnerTable({ entries }: { entries: DrawHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">아직 당첨자가 없습니다.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-1 pr-2">회차</th>
            <th className="py-1 pr-2">당첨자</th>
            <th className="py-1 pr-2">경품</th>
            <th className="py-1 pr-2">시각</th>
            <th className="py-1">상태</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-slate-100">
              <td className="py-1 pr-2">{e.round}</td>
              <td className="py-1 pr-2">{e.participantName}</td>
              <td className="py-1 pr-2">{e.prizeName}</td>
              <td className="py-1 pr-2 text-slate-400">
                {new Date(e.createdAt).toLocaleTimeString()}
              </td>
              <td className="py-1 text-emerald-600">수령 완료</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
