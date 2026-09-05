import { useEventStore } from '../../store/eventStore'

export function StartSummary() {
  const participantCount = useEventStore((s) => s.participants.length)
  const prizes = useEventStore((s) => s.prizes)
  const startEvent = useEventStore((s) => s.startEvent)

  const totalQuantity = prizes.reduce((sum, p) => sum + p.remainingQuantity, 0)
  const canStart = participantCount > 0 && prizes.length > 0

  return (
    <div className="space-y-3 rounded border border-slate-300 bg-white p-4">
      <h3 className="font-semibold text-slate-800">시작 전 요약</h3>
      <dl className="grid grid-cols-2 gap-y-1 text-sm text-slate-600">
        <dt>추첨 대상 인원</dt>
        <dd className="text-right">{participantCount}명</dd>
        <dt>총 경품 수량</dt>
        <dd className="text-right">{totalQuantity}개</dd>
        <dt>경품 종류 수</dt>
        <dd className="text-right">{prizes.length}종</dd>
        <dt>꽝 칸 포함 여부</dt>
        <dd className="text-right">{prizes.length > 0 ? '포함 (1칸)' : '-'}</dd>
      </dl>
      <button
        type="button"
        onClick={startEvent}
        disabled={!canStart}
        className="w-full rounded bg-indigo-600 px-4 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        추첨 시작
      </button>
      {!canStart && (
        <p className="text-xs text-slate-400">
          참가자 1명 이상, 경품 1개 이상 등록해야 시작할 수 있습니다.
        </p>
      )}
    </div>
  )
}
