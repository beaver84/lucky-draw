import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'

function prizesToLines(prizes: { name: string; initialQuantity: number }[]): string {
  return prizes.flatMap((p) => Array(p.initialQuantity).fill(p.name)).join('\n')
}

export function PrizePanel() {
  const prizes = useEventStore((s) => s.prizes)
  const setPrizesFromText = useEventStore((s) => s.setPrizesFromText)
  const [text, setText] = useState(() => prizesToLines(prizes))

  function handleTextChange(value: string) {
    setText(value)
    setPrizesFromText(value)
  }

  const totalQuantity = prizes.reduce((sum, p) => sum + p.remainingQuantity, 0)

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-slate-800">경품</h3>
      <p className="text-xs text-slate-500">
        한 줄에 하나씩. 같은 경품 여러 개는 같은 이름을 여러 줄로.
      </p>

      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        rows={10}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />

      <p className="text-sm text-slate-600">
        경품 <span className="font-medium">{totalQuantity}</span>개
      </p>
    </div>
  )
}
