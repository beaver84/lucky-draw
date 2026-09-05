import { useState } from 'react'
import { useEventStore } from '../../store/eventStore'
import type { Prize } from '../../types'

export function PrizeList() {
  const prizes = useEventStore((s) => s.prizes)
  const removePrize = useEventStore((s) => s.removePrize)
  const updatePrize = useEventStore((s) => s.updatePrize)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700">경품 목록 ({prizes.length}종)</h4>

      {prizes.length === 0 ? (
        <p className="text-sm text-slate-400">등록된 경품이 없습니다.</p>
      ) : (
        <ul className="space-y-1">
          {prizes.map((prize) =>
            editingId === prize.id ? (
              <PrizeEditRow
                key={prize.id}
                prize={prize}
                onSave={(changes) => {
                  updatePrize(prize.id, changes)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <li
                key={prize.id}
                className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5 text-sm"
              >
                <span>
                  {prize.name}{' '}
                  <span className="text-slate-400">
                    ({prize.remainingQuantity}/{prize.initialQuantity})
                  </span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(prize.id)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => removePrize(prize.id)}
                    className="text-xs text-slate-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                </span>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}

function PrizeEditRow({
  prize,
  onSave,
  onCancel,
}: {
  prize: Prize
  onSave: (changes: { name?: string; initialQuantity?: number }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(prize.name)
  const [quantity, setQuantity] = useState(String(prize.initialQuantity))

  function handleSave() {
    const qty = Number(quantity)
    if (name.trim().length === 0 || !Number.isInteger(qty) || qty < 1) return
    onSave({ name: name.trim(), initialQuantity: qty })
  }

  return (
    <li className="flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-sm">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <button type="button" onClick={handleSave} className="text-xs font-medium text-emerald-600">
        저장
      </button>
      <button type="button" onClick={onCancel} className="text-xs text-slate-400">
        취소
      </button>
    </li>
  )
}
