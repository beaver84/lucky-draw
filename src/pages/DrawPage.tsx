import { useState } from 'react'
import { useEventStore } from '../store/eventStore'
import { computeWheelSlots } from '../domain/draw'
import { Wheel } from '../components/draw/Wheel'
import { DrawControls } from '../components/draw/DrawControls'
import { ResultModal } from '../components/draw/ResultModal'
import { StatusPanel } from '../components/status/StatusPanel'
import { EndControls } from '../components/status/EndControls'

interface DrawResult {
  participantName: string
  isPrize: boolean
  prizeName: string | null
  remainingTotal: number
}

export function DrawPage() {
  const pendingDraw = useEventStore((s) => s.pendingDraw)
  const prizes = useEventStore((s) => s.prizes)
  const config = useEventStore((s) => s.config)
  const history = useEventStore((s) => s.history)
  const startDraw = useEventStore((s) => s.startDraw)
  const commitPendingDraw = useEventStore((s) => s.commitPendingDraw)

  const [spinToken, setSpinToken] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [result, setResult] = useState<DrawResult | null>(null)

  const wheelSlots = pendingDraw ? pendingDraw.slots : computeWheelSlots(prizes)
  const targetIndex = pendingDraw ? pendingDraw.resultIndex : null
  const completed = config.status === 'COMPLETED'

  function handleDraw() {
    setMessage(null)
    const started = startDraw()
    if (!started) {
      setMessage('추첨할 수 없습니다. 남은 추첨 대상이 없습니다.')
      return
    }
    setSpinToken((t) => t + 1)
  }

  function handleSpinEnd() {
    const pd = useEventStore.getState().pendingDraw
    if (!pd) return
    const slot = pd.slots[pd.resultIndex]
    const isPrize = slot.kind === 'PRIZE'
    commitPendingDraw()
    const remainingTotal = useEventStore
      .getState()
      .prizes.reduce((sum, p) => sum + p.remainingQuantity, 0)
    setResult({
      participantName: pd.participant.displayName,
      isPrize,
      prizeName: isPrize ? slot.prizeName : null,
      remainingTotal,
    })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800">추첨 진행</h1>
      {!completed && <p className="text-sm text-slate-500">회차 {history.length + 1}</p>}

      {completed ? (
        <div className="rounded border border-slate-300 bg-white px-6 py-8 text-center">
          <p className="text-xl font-bold text-slate-800">추첨이 완료되었습니다</p>
          <p className="mt-2 text-sm text-slate-500">모든 경품이 소진되었거나 추첨 대상이 없습니다.</p>
        </div>
      ) : (
        <>
          <Wheel
            slots={wheelSlots}
            targetIndex={targetIndex}
            spinSpeed={config.spinSpeed}
            spinToken={spinToken}
            onSpinEnd={handleSpinEnd}
          />
          <DrawControls
            disabled={pendingDraw !== null || result !== null}
            spinning={pendingDraw !== null}
            onDraw={handleDraw}
            message={message}
          />
        </>
      )}

      {result && (
        <ResultModal
          participantName={result.participantName}
          isPrize={result.isPrize}
          prizeName={result.prizeName}
          remainingTotal={result.remainingTotal}
          onNext={() => setResult(null)}
        />
      )}

      <StatusPanel />
      <EndControls />
    </div>
  )
}
