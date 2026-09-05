export interface PrizeInput {
  name: string
  quantity: number
}

export function parsePrizeLines(raw: string): PrizeInput[] {
  const order: string[] = []
  const quantities = new Map<string, number>()

  for (const line of raw.split('\n')) {
    const name = line.trim()
    if (name.length === 0) continue
    if (!quantities.has(name)) {
      order.push(name)
      quantities.set(name, 0)
    }
    quantities.set(name, quantities.get(name)! + 1)
  }

  return order.map((name) => ({ name, quantity: quantities.get(name)! }))
}
