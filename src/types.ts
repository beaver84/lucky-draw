export type ParticipantStatus = 'ELIGIBLE' | 'WINNER' | 'ELIMINATED'

export interface Participant {
  id: string
  displayName: string
  status: ParticipantStatus
  createdAt: string
  resultAt: string | null
}

export interface Prize {
  id: string
  name: string
  initialQuantity: number
  remainingQuantity: number
  createdAt: string
}

export type DrawResultType = 'PRIZE' | 'LOSE'

export interface DrawHistoryEntry {
  id: string
  round: number
  participantId: string
  participantName: string
  resultType: DrawResultType
  prizeId: string | null
  prizeName: string | null
  createdAt: string
}

export type SpinSpeed = 'SLOW' | 'NORMAL' | 'FAST'

export type EventStatus = 'SETUP' | 'IN_PROGRESS' | 'COMPLETED'

export interface EventConfig {
  eliminateOnLose: boolean
  spinSpeed: SpinSpeed
  soundEnabled: boolean
  theme: 'default' | 'high-contrast'
  status: EventStatus
}
