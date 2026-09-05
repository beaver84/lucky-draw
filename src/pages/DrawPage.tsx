import { useState } from 'react'
import { useEventStore } from '../store/eventStore'
import { computeWheelSlots } from '../domain/draw'
import { Wheel } from '../components/draw/Wheel'
import { DrawHeader } from '../components/draw/DrawHeader'
import { StatTiles } from '../components/draw/StatTiles'
import { WinnerRows } from '../components/draw/WinnerRows'
import { ResultBanner } from '../components/draw/ResultBanner'
import { DrawActionBar } from '../components/draw/DrawActionBar'
import { CompletedSummary } from '../components/draw/CompletedSummary'
import { StatusPanel } from '../components/status/StatusPanel'
import { EndControls } from '../components/status/EndControls'
import { celebrateWin } from '../lib/confetti'

interface DrawResult {
  participantName: string
  isPrize: boolean
  prizeName: string | null
}

export function DrawPage() {
  const pendingDraw = useEventStore((s) => s.pendingDraw)
  const participants = useEventStore((s) => s.participants)
  const prizes = useEventStore((s) => s.prizes)
  const config = useEventStore((s) => s.config)
  const history = useEventStore((s) => s.history)
  const startDraw = useEventStore((s) => s.startDraw)
  const commitPendingDraw = useEventStore((s) => s.commitPendingDraw)
  const resetAll = useEventStore((s) => s.resetAll)

  const [spinToken, setSpinToken] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [result, setResult] = useState<DrawResult | null>(null)

  if (config.status === 'COMPLETED') {
    return <CompletedSummary />
  }

  const wheelSlots = pendingDraw ? pendingDraw.slots : computeWheelSlots(prizes)
  const targetIndex = pendingDraw ? pendingDraw.resultIndex : null
  const winnerEntries = history.filter((h) => h.resultType === 'PRIZE')
  const remainingParticipants = participants.filter((p) => p.status === 'ELIGIBLE').length
  const remainingPrizes = prizes.reduce((sum, p) => sum + p.remainingQuantity, 0)

  function handleDraw() {
    setMessage(null)
    setResult(null)
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
    setResult({
      participantName: pd.participant.displayName,
      isPrize,
      prizeName: isPrize ? slot.prizeName : null,
    })
    if (isPrize) celebrateWin()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <DrawHeader
        round={history.length + 1}
        participantName={pendingDraw ? null : (result?.participantName ?? null)}
      />

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <div className="flex justify-center">
          <Wheel
            slots={wheelSlots}
            targetIndex={targetIndex}
            spinSpeed={config.spinSpeed}
            spinToken={spinToken}
            onSpinEnd={handleSpinEnd}
          />
        </div>

        <div className="space-y-4">
          <StatTiles
            remainingParticipants={remainingParticipants}
            remainingPrizes={remainingPrizes}
            completedRounds={history.length}
          />
          <div className="rounded border border-slate-200 bg-white">
            <h2 className="border-b border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              당첨자 명단
            </h2>
            <WinnerRows entries={winnerEntries} />
          </div>
        </div>
      </div>

      {result && !pendingDraw && (
        <ResultBanner
          participantName={result.participantName}
          isPrize={result.isPrize}
          prizeName={result.prizeName}
        />
      )}

      <DrawActionBar
        disabled={pendingDraw !== null}
        spinning={pendingDraw !== null}
        message={message}
        onDraw={handleDraw}
        onReset={resetAll}
      />

      <StatusPanel />
      <EndControls />
    </div>
  )
}
