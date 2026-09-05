import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'
import { historyToCsv } from '../../domain/csv'
import { downloadTextFile } from '../../lib/download'
import { WinnerRows } from './WinnerRows'

export function CompletedSummary() {
  const participants = useEventStore((s) => s.participants)
  const prizes = useEventStore((s) => s.prizes)
  const history = useEventStore((s) => s.history)
  const resetAll = useEventStore((s) => s.resetAll)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const winnerEntries = [...history].filter((h) => h.resultType === 'PRIZE').reverse()
  const notWon = participants.filter((p) => p.status !== 'WINNER')
  const remainingPrizes = prizes.filter((p) => p.remainingQuantity > 0)

  function handleDownloadCsv() {
    downloadTextFile(
      `lucky-draw-results-${new Date().toISOString().slice(0, 10)}.csv`,
      historyToCsv(history),
      'text/csv;charset=utf-8;',
    )
  }

  function handleReset() {
    if (!confirmingReset) {
      setConfirmingReset(true)
      return
    }
    resetAll()
    setConfirmingReset(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">추첨 종료</h1>
          <p className="mt-1 text-sm text-slate-500">
            총 {winnerEntries.length}건 당첨 · {history.length} 라운드 진행
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={history.length === 0}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            CSV 내보내기
          </button>
          <button
            type="button"
            onClick={handleReset}
            onBlur={() => setConfirmingReset(false)}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            {confirmingReset ? '정말 초기화? (다시 클릭)' : '새 추첨'}
          </button>
        </div>
      </div>

      <div className="rounded border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-800">
          당첨자 명단
        </h2>
        <WinnerRows entries={winnerEntries} />
      </div>

      <div className="rounded border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-800">미당첨 참가자 ({notWon.length})</h2>
        {notWon.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">모든 참가자가 당첨되었습니다.</p>
        ) : (
          <ol className="mt-2 space-y-1 text-sm text-slate-600">
            {notWon.map((p, i) => (
              <li key={p.id}>
                {i + 1}. {p.displayName}
              </li>
            ))}
          </ol>
        )}
      </div>

      {remainingPrizes.length > 0 && (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-800">미소진 경품</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {remainingPrizes.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span>
                  {p.remainingQuantity}/{p.initialQuantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
