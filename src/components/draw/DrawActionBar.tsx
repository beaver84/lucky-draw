import { useState } from 'react'

interface DrawActionBarProps {
  disabled: boolean
  spinning: boolean
  message: string | null
  onDraw: () => void
  onReset: () => void
}

export function DrawActionBar({ disabled, spinning, message, onDraw, onReset }: DrawActionBarProps) {
  const [confirmingReset, setConfirmingReset] = useState(false)

  function handleReset() {
    if (!confirmingReset) {
      setConfirmingReset(true)
      return
    }
    onReset()
    setConfirmingReset(false)
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDraw}
          disabled={disabled}
          className="rounded bg-indigo-600 px-8 py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {spinning ? '돌리는 중...' : '돌리기'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          onBlur={() => setConfirmingReset(false)}
          className="rounded border border-red-300 px-4 py-3 text-sm font-medium text-red-600"
        >
          {confirmingReset ? '정말 초기화? (다시 클릭)' : '초기화'}
        </button>
      </div>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  )
}
