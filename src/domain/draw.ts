import type { Participant, Prize } from '../types'

export type WheelSlot =
  | { kind: 'PRIZE'; prizeId: string; prizeName: string }
  | { kind: 'LOSE' }

/**
 * One slot per remaining prize unit, plus exactly one LOSE slot.
 * Uniform pick over these slots gives each prize a win probability of
 * remainingQuantity / (sum(remainingQuantity) + 1), matching spec §6.2.
 */
export function computeWheelSlots(prizes: Prize[]): WheelSlot[] {
  const slots: WheelSlot[] = []
  for (const prize of prizes) {
    if (prize.remainingQuantity <= 0) continue
    for (let i = 0; i < prize.remainingQuantity; i += 1) {
      slots.push({ kind: 'PRIZE', prizeId: prize.id, prizeName: prize.name })
    }
  }
  slots.push({ kind: 'LOSE' })
  return slots
}

export function pickParticipant(eligible: Participant[]): Participant | null {
  if (eligible.length === 0) return null
  const index = Math.floor(Math.random() * eligible.length)
  return eligible[index]
}

export interface SpinOutcome {
  index: number
  slot: WheelSlot
}

export function spinWheel(slots: WheelSlot[]): SpinOutcome {
  if (slots.length === 0) throw new Error('cannot spin an empty wheel')
  const index = Math.floor(Math.random() * slots.length)
  return { index, slot: slots[index] }
}
