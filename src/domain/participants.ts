export function parseParticipantLines(raw: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const piece of raw.split(/[\n,\t]+/)) {
    const trimmed = piece.trim()
    if (trimmed.length === 0 || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }

  return result
}

export function generateNumberedParticipants(count: number): string[] {
  if (!Number.isInteger(count) || count < 1) return []
  return Array.from({ length: count }, (_, i) => String(i + 1))
}
