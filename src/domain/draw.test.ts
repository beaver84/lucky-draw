import { describe, expect, it } from 'vitest'
import { computeWheelSlots, pickParticipant, spinWheel } from './draw'
import type { Participant, Prize } from '../types'

function makePrize(overrides: Partial<Prize>): Prize {
  return {
    id: crypto.randomUUID(),
    name: 'prize',
    initialQuantity: 1,
    remainingQuantity: 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeParticipant(overrides: Partial<Participant>): Participant {
  return {
    id: crypto.randomUUID(),
    displayName: 'participant',
    status: 'ELIGIBLE',
    createdAt: new Date().toISOString(),
    resultAt: null,
    ...overrides,
  }
}

describe('computeWheelSlots', () => {
  it('produces one slot per remaining unit plus exactly one LOSE slot', () => {
    const prizes = [
      makePrize({ id: 'a', name: '커피 쿠폰', remainingQuantity: 3 }),
      makePrize({ id: 'b', name: '영화권', remainingQuantity: 1 }),
    ]
    const slots = computeWheelSlots(prizes)
    expect(slots).toHaveLength(5)
    expect(slots.filter((s) => s.kind === 'LOSE')).toHaveLength(1)
    expect(slots.filter((s) => s.kind === 'PRIZE' && s.prizeId === 'a')).toHaveLength(3)
    expect(slots.filter((s) => s.kind === 'PRIZE' && s.prizeId === 'b')).toHaveLength(1)
  })

  it('excludes prizes with zero remaining quantity', () => {
    const prizes = [makePrize({ remainingQuantity: 0 })]
    const slots = computeWheelSlots(prizes)
    expect(slots).toEqual([{ kind: 'LOSE' }])
  })

  it('always includes exactly one LOSE slot even with no prizes', () => {
    expect(computeWheelSlots([])).toEqual([{ kind: 'LOSE' }])
  })
})

describe('pickParticipant', () => {
  it('returns null when no eligible participants remain', () => {
    expect(pickParticipant([])).toBeNull()
  })

  it('only ever picks from the given eligible list', () => {
    const eligible = [makeParticipant({ id: '1' }), makeParticipant({ id: '2' })]
    for (let i = 0; i < 50; i += 1) {
      const picked = pickParticipant(eligible)
      expect(eligible.some((p) => p.id === picked?.id)).toBe(true)
    }
  })
})

describe('spinWheel', () => {
  it('throws on an empty slot list', () => {
    expect(() => spinWheel([])).toThrow()
  })

  it('approximates probability proportional to remaining quantity over many trials', () => {
    const prizes = [
      makePrize({ id: 'a', name: 'A', remainingQuantity: 3 }),
      makePrize({ id: 'b', name: 'B', remainingQuantity: 1 }),
    ]
    const slots = computeWheelSlots(prizes) // total 5 slots: A=3/5, B=1/5, LOSE=1/5
    const trials = 20000
    const counts = { A: 0, B: 0, LOSE: 0 }
    for (let i = 0; i < trials; i += 1) {
      const { slot } = spinWheel(slots)
      if (slot.kind === 'LOSE') counts.LOSE += 1
      else if (slot.prizeId === 'a') counts.A += 1
      else counts.B += 1
    }
    expect(counts.A / trials).toBeCloseTo(3 / 5, 1)
    expect(counts.B / trials).toBeCloseTo(1 / 5, 1)
    expect(counts.LOSE / trials).toBeCloseTo(1 / 5, 1)
  })
})
