import type { DrawHistoryEntry } from '../types'

const HEADERS = ['회차', '참가자', '결과', '경품', '시각']

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function historyToCsv(history: DrawHistoryEntry[]): string {
  const rows = history.map((h) => [
    String(h.round),
    h.participantName,
    h.resultType === 'PRIZE' ? '당첨' : '꽝',
    h.prizeName ?? '',
    new Date(h.createdAt).toLocaleString(),
  ])
  return [HEADERS, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n')
}
