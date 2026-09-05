import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'
import { historyToCsv } from '../../domain/csv'

export function EndControls() {
  const history = useEventStore((s) => s.history)
  const resetAll = useEventStore((s) => s.resetAll)
  const [confirmingReset, setConfirmingReset] = useState(false)

  function handleDownloadCsv() {
    const csv = historyToCsv(history)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lucky-draw-results-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
    <div className="flex w-full items-center justify-between rounded border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={handleDownloadCsv}
        disabled={history.length === 0}
        className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        결과 CSV 다운로드
      </button>
      <button
        type="button"
        onClick={handleReset}
        onBlur={() => setConfirmingReset(false)}
        className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600"
      >
        {confirmingReset ? '정말 초기화하시겠습니까? 되돌릴 수 없습니다. (다시 클릭)' : '행사 초기화'}
      </button>
    </div>
  )
}
