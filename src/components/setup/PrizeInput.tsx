import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'
import { parsePrizeBulkInput } from '../../domain/prizes'

export function PrizeInput() {
  const addPrize = useEventStore((s) => s.addPrize)
  const status = useEventStore((s) => s.config.status)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [bulk, setBulk] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const started = status !== 'SETUP'

  function handleAddSingle() {
    const qty = Number(quantity)
    if (name.trim().length === 0 || !Number.isInteger(qty) || qty < 1) {
      setFeedback('경품명과 1 이상의 수량을 입력하세요.')
      return
    }
    addPrize({ name: name.trim(), quantity: qty })
    setName('')
    setQuantity('1')
    setFeedback(null)
  }

  function handleAddBulk() {
    const { valid, invalidLines } = parsePrizeBulkInput(bulk)
    for (const entry of valid) addPrize(entry)
    setBulk('')
    setFeedback(
      invalidLines.length > 0
        ? `${valid.length}건 등록됨, ${invalidLines.length}건 형식 오류로 제외됨`
        : `${valid.length}건 등록됨`,
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">경품 입력</h3>
      {started && (
        <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
          이미 추첨이 시작되었습니다. 경품을 수정하면 진행 중인 원판 구성에 영향을 줄 수 있습니다.
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="경품명"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddSingle}
          className="whitespace-nowrap rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          추가
        </button>
      </div>

      <div className="space-y-1">
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={'경품명,수량 형식으로 줄 단위 입력 (예: 커피 쿠폰,5)'}
          rows={4}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddBulk}
          className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white"
        >
          일괄 추가
        </button>
      </div>

      {feedback && <p className="text-sm text-slate-600">{feedback}</p>}
    </div>
  )
}
