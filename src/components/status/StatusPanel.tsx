import { useMemo } from 'react'
import { useEventStore } from '../../store/eventStore'
import { WinnerTable } from './WinnerTable'
import { LoseTable } from './LoseTable'

export function StatusPanel() {
  const participants = useEventStore((s) => s.participants)
  const prizes = useEventStore((s) => s.prizes)
  const history = useEventStore((s) => s.history)
  const eliminateOnLose = useEventStore((s) => s.config.eliminateOnLose)

  const participantsById = useMemo(
    () => new Map(participants.map((p) => [p.id, p])),
    [participants],
  )

  const remainingParticipants = participants.filter((p) => p.status === 'ELIGIBLE').length
  const notYetWonCount = participants.filter((p) => p.status !== 'WINNER').length
  const totalRemainingQuantity = prizes.reduce((sum, p) => sum + p.remainingQuantity, 0)
  const currentRound = history.length

  const winnerEntries = history.filter((h) => h.resultType === 'PRIZE')
  const loseEntries = history.filter((h) => h.resultType === 'LOSE')

  return (
    <div className="w-full space-y-4 rounded border border-slate-200 bg-white p-4">
      <h2 className="font-semibold text-slate-800">현황</h2>

      <dl className="grid grid-cols-2 gap-y-1 text-sm text-slate-600 md:grid-cols-3">
        <dt>남은 추첨 대상</dt>
        <dd className="text-right md:text-left">{remainingParticipants}명</dd>
        <dt>전체 경품 잔여</dt>
        <dd className="text-right md:text-left">{totalRemainingQuantity}개</dd>
        <dt>현재 회차</dt>
        <dd className="text-right md:text-left">{currentRound}회차</dd>
        <dt>미당첨 참가자</dt>
        <dd className="text-right md:text-left">{notYetWonCount}명</dd>
      </dl>

      <div>
        <h3 className="mb-1 text-sm font-medium text-slate-700">경품별 남은 수량</h3>
        {prizes.length === 0 ? (
          <p className="text-sm text-slate-400">등록된 경품이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-3">
            {prizes.map((p) => (
              <li key={p.id} className="flex justify-between text-slate-600">
                <span>{p.name}</span>
                <span>
                  {p.remainingQuantity}/{p.initialQuantity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-slate-700">당첨자 명단</h3>
        <WinnerTable entries={winnerEntries} />
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-slate-700">꽝 결과 명단</h3>
        <LoseTable
          entries={loseEntries}
          participantsById={participantsById}
          eliminateOnLose={eliminateOnLose}
        />
      </div>
    </div>
  )
}
