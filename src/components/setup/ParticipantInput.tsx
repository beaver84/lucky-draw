import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'
import { splitBulkInput } from '../../domain/participants'

export function ParticipantInput() {
  const addParticipants = useEventStore((s) => s.addParticipants)
  const [single, setSingle] = useState('')
  const [bulk, setBulk] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  function handleAddSingle() {
    if (single.trim().length === 0) return
    const { duplicateCount, emptyCount } = addParticipants([single])
    setSingle('')
    setFeedback(describeResult(1, duplicateCount, emptyCount))
  }

  function handleAddBulk() {
    const values = splitBulkInput(bulk)
    if (values.length === 0) return
    const { duplicateCount, emptyCount } = addParticipants(values)
    setBulk('')
    setFeedback(describeResult(values.length, duplicateCount, emptyCount))
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">참가자 입력</h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={single}
          onChange={(e) => setSingle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
          placeholder="이름 또는 번호 입력"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddSingle}
          className="whitespace-nowrap rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          추가
        </button>
      </div>

      <div className="space-y-1">
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={'줄바꿈, 쉼표, 탭으로 구분해 한 번에 입력'}
          rows={4}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddBulk}
          className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white"
        >
          일괄 추가
        </button>
      </div>

      {feedback && <p className="text-sm text-slate-600">{feedback}</p>}
    </div>
  )
}

function describeResult(total: number, duplicateCount: number, emptyCount: number): string {
  const addedCount = total - duplicateCount - emptyCount
  const parts = [`${addedCount}명 등록됨`]
  if (duplicateCount > 0) parts.push(`중복 ${duplicateCount}건 제외`)
  if (emptyCount > 0) parts.push(`빈 값 ${emptyCount}건 제외`)
  return parts.join(', ')
}
