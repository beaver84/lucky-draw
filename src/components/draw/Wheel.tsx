import { useEffect, useMemo, useRef, useState } from 'react'
import type { WheelSlot } from '../../domain/draw'
import type { SpinSpeed } from '../../types'

const SPIN_DURATION_MS: Record<SpinSpeed, number> = {
  SLOW: 6000,
  NORMAL: 4000,
  FAST: 2000,
}

const COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6']
const LOSE_COLOR = '#94a3b8'

function truncateLabel(label: string, max = 8): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

interface WheelProps {
  slots: WheelSlot[]
  targetIndex: number | null
  spinSpeed: SpinSpeed
  spinToken: number
  onSpinEnd: () => void
}

export function Wheel({ slots, targetIndex, spinSpeed, spinToken, onSpinEnd }: WheelProps) {
  const sliceAngle = 360 / slots.length
  const [rotation, setRotation] = useState(0)
  const spinning = useRef(false)

  const sliceColors = useMemo(
    () => slots.map((slot, i) => (slot.kind === 'LOSE' ? LOSE_COLOR : COLORS[i % COLORS.length])),
    [slots],
  )

  useEffect(() => {
    if (targetIndex === null) return
    spinning.current = true
    const targetCenter = targetIndex * sliceAngle + sliceAngle / 2
    // pointer sits at top (0deg); rotate so target slice center lands there, plus extra full spins
    const extraSpins = 4 * 360
    const finalRotation = extraSpins + (360 - targetCenter)
    setRotation((prev) => prev - (prev % 360) + finalRotation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken])

  const duration = SPIN_DURATION_MS[spinSpeed]

  function handleTransitionEnd() {
    if (!spinning.current) return
    spinning.current = false
    onSpinEnd()
  }

  const legendItems = useMemo(() => {
    const seen = new Map<string, string>()
    for (const slot of slots) {
      if (slot.kind === 'PRIZE' && !seen.has(slot.prizeId)) seen.set(slot.prizeId, slot.prizeName)
    }
    return Array.from(seen.entries())
  }, [slots])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: 320, height: 320 }}>
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '22px solid #1e293b',
          }}
          aria-hidden
        />
        <svg
          viewBox="-1 -1 2 2"
          width={320}
          height={320}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: `transform ${duration}ms cubic-bezier(0.17, 0.67, 0.32, 1)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slots.map((slot, i) => {
            const startAngle = (i * sliceAngle - 90) * (Math.PI / 180)
            const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180)
            const x1 = Math.cos(startAngle)
            const y1 = Math.sin(startAngle)
            const x2 = Math.cos(endAngle)
            const y2 = Math.sin(endAngle)
            const largeArc = sliceAngle > 180 ? 1 : 0
            const label = slot.kind === 'LOSE' ? '꽝' : truncateLabel(slot.prizeName)
            const midAngle = (startAngle + endAngle) / 2
            const labelX = Math.cos(midAngle) * 0.65
            const labelY = Math.sin(midAngle) * 0.65
            // Intentionally not flipped for "upside-down" ranges: the spin's
            // target rotation is computed so the winning slice always lands
            // upright under the pointer. A static per-slice flip would cancel
            // that guarantee for whichever slice ends up on top.
            const labelRotation = i * sliceAngle + sliceAngle / 2

            return (
              <g key={i}>
                <path
                  d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={sliceColors[i]}
                  stroke="white"
                  strokeWidth={0.01}
                />
                <text
                  x={labelX}
                  y={labelY}
                  fontSize={0.08}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${labelRotation}, ${labelX}, ${labelY})`}
                >
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {legendItems.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {legendItems.map(([id, name]) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
