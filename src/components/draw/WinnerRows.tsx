import type { DrawHistoryEntry } from '../../types'

export function WinnerRows({ entries }: { entries: DrawHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="p-4 text-sm text-slate-400">아직 당첨자가 없습니다.</p>
  }

  return (
    <ul className="divide-y divide-slate-100">
      {entries.map((e) => (
        <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
          <div>
            <span className="mr-2 text-slate-400">#{e.round}</span>
            <span className="font-semibold text-slate-800">{e.participantName}</span>
            <p className="mt-0.5 text-xs text-slate-400">
              {new Date(e.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <span className="font-semibold text-indigo-600">{e.prizeName}</span>
        </li>
      ))}
    </ul>
  )
}
