interface ResultModalProps {
  participantName: string
  isPrize: boolean
  prizeName: string | null
  remainingTotal: number
  onNext: () => void
}

export function ResultModal({
  participantName,
  isPrize,
  prizeName,
  remainingTotal,
  onNext,
}: ResultModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
        {isPrize ? (
          <>
            <p className="text-lg font-semibold text-indigo-600">축하합니다!</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">
              {participantName}님이 {prizeName}에 당첨되셨습니다.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-slate-500">아쉽지만 이번 결과는 꽝입니다.</p>
            <p className="mt-2 text-xl font-bold text-slate-800">
              {participantName}님, 다음 기회를 기다려 주세요.
            </p>
          </>
        )}
        <p className="mt-4 text-sm text-slate-400">남은 경품 수: {remainingTotal}개</p>
        <button
          type="button"
          onClick={onNext}
          className="mt-6 w-full rounded bg-indigo-600 px-4 py-3 text-base font-semibold text-white"
        >
          다음 추첨
        </button>
      </div>
    </div>
  )
}
