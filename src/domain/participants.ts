import type { Participant } from '../types'

export function splitBulkInput(raw: string): string[] {
  return raw
    .split(/[\n,\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export interface AddParticipantsResult {
  added: string[]
  duplicateCount: number
  emptyCount: number
}

export function resolveNewParticipants(
  rawValues: string[],
  existing: Participant[],
): AddParticipantsResult {
  const existingNames = new Set(existing.map((p) => p.displayName))
  const added: string[] = []
  let duplicateCount = 0
  let emptyCount = 0

  for (const raw of rawValues) {
    const trimmed = raw.trim()
    if (trimmed.length === 0) {
      emptyCount += 1
      continue
    }
    if (existingNames.has(trimmed) || added.includes(trimmed)) {
      duplicateCount += 1
      continue
    }
    added.push(trimmed)
  }

  return { added, duplicateCount, emptyCount }
}
