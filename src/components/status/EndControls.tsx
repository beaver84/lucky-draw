import { useEventStore } from '../../store/eventStore'
import { historyToCsv } from '../../domain/csv'
import { downloadTextFile } from '../../lib/download'

export function EndControls() {
  const history = useEventStore((s) => s.history)

  function handleDownloadCsv() {
    downloadTextFile(
      `lucky-draw-results-${new Date().toISOString().slice(0, 10)}.csv`,
      historyToCsv(history),
      'text/csv;charset=utf-8;',
    )
  }

  return (
    <div className="flex w-full items-center rounded border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={handleDownloadCsv}
        disabled={history.length === 0}
        className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        결과 CSV 다운로드
      </button>
    </div>
  )
}
