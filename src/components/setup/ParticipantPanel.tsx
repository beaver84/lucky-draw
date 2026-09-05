import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'
import { generateNumberedParticipants } from '../../domain/participants'

export function ParticipantPanel() {
  const participants = useEventStore((s) => s.participants)
  const setParticipantsFromText = useEventStore((s) => s.setParticipantsFromText)
  const [text, setText] = useState(() => participants.map((p) => p.displayName).join('\n'))
  const [count, setCount] = useState('')

  function handleTextChange(value: string) {
    setText(value)
    setParticipantsFromText(value)
  }

  function handleCountChange(value: string) {
    setCount(value)
    const n = Number(value)
    if (!Number.isInteger(n) || n < 1) return
    const generated = generateNumberedParticipants(n).join('\n')
    setText(generated)
    setParticipantsFromText(generated)
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-slate-800">참가자</h3>
      <p className="text-xs text-slate-500">이름을 줄바꿈 또는 쉼표로 구분해 입력하세요.</p>

      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        rows={10}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />

      <p className="text-sm text-slate-600">
        참가자 <span className="font-medium">{participants.length}</span>명
      </p>

      <div className="space-y-1">
        <p className="text-xs text-slate-500">또는 인원 수로 자동 생성(1~N 번호)</p>
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => handleCountChange(e.target.value)}
          placeholder="예: 30"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  )
}
