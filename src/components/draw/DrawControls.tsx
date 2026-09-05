interface DrawControlsProps {
  disabled: boolean
  spinning: boolean
  onDraw: () => void
  message: string | null
}

export function DrawControls({ disabled, spinning, onDraw, message }: DrawControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onDraw}
        disabled={disabled}
        className="rounded bg-indigo-600 px-8 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {spinning ? '추첨 중...' : '추첨하기'}
      </button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  )
}
