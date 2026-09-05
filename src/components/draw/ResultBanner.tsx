interface ResultBannerProps {
  participantName: string
  isPrize: boolean
  prizeName: string | null
}

export function ResultBanner({ participantName, isPrize, prizeName }: ResultBannerProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded border border-indigo-200 bg-indigo-50 px-4 py-3">
      <span className="rounded border border-indigo-300 px-2 py-0.5 text-xs font-medium text-indigo-600">
        {isPrize ? '당첨' : '꽝'}
      </span>
      <span className="text-lg font-bold text-indigo-700">
        {participantName} — {isPrize ? prizeName : '꽝'}
      </span>
    </div>
  )
}
