import type { Prize } from '../types'

export interface PrizeInput {
  name: string
  quantity: number
}

export interface ParsePrizeBulkResult {
  valid: PrizeInput[]
  invalidLines: string[]
}

export function parsePrizeBulkInput(raw: string): ParsePrizeBulkResult {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const valid: PrizeInput[] = []
  const invalidLines: string[] = []

  for (const line of lines) {
    const [namePart, quantityPart] = line.split(',')
    const name = namePart?.trim()
    const quantity = Number(quantityPart?.trim())

    if (!name || !Number.isInteger(quantity) || quantity < 1) {
      invalidLines.push(line)
      continue
    }

    valid.push({ name, quantity })
  }

  return { valid, invalidLines }
}

export function isValidPrizeQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1
}

export function upsertPrize(prizes: Prize[], input: PrizeInput, makePrize: () => Prize): Prize[] {
  const existingIndex = prizes.findIndex((p) => p.name === input.name)

  if (existingIndex === -1) {
    return [...prizes, makePrize()]
  }

  return prizes.map((p, i) =>
    i === existingIndex
      ? {
          ...p,
          initialQuantity: p.initialQuantity + input.quantity,
          remainingQuantity: p.remainingQuantity + input.quantity,
        }
      : p,
  )
}
