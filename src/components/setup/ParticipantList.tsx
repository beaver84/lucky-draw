import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'

export function ParticipantList() {
  const participants = useEventStore((s) => s.participants)
  const removeParticipant = useEventStore((s) => s.removeParticipant)
  const clearParticipants = useEventStore((s) => s.clearParticipants)
  const [confirmingClear, setConfirmingClear] = useState(false)

  function handleClearAll() {
    if (!confirmingClear) {
      setConfirmingClear(true)
      return
    }
    clearParticipants()
    setConfirmingClear(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">참가자 목록 ({participants.length}명)</h4>
        {participants.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            onBlur={() => setConfirmingClear(false)}
            className="text-xs font-medium text-red-600"
          >
            {confirmingClear ? '정말 전체 삭제하시겠습니까? (다시 클릭)' : '전체 삭제'}
          </button>
        )}
      </div>

      {participants.length === 0 ? (
        <p className="text-sm text-slate-400">등록된 참가자가 없습니다.</p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {participants.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5 text-sm"
            >
              <span>{p.displayName}</span>
              <button
                type="button"
                onClick={() => removeParticipant(p.id)}
                className="text-xs text-slate-400 hover:text-red-600"
                aria-label={`${p.displayName} 삭제`}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
