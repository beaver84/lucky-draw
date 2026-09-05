import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DrawHistoryEntry,
  EventConfig,
  Participant,
  Prize,
} from '../types'
import { parseParticipantLines } from '../domain/participants'
import { parsePrizeLines } from '../domain/prizes'
import { computeWheelSlots, pickParticipant, spinWheel, type WheelSlot } from '../domain/draw'

export interface PendingDraw {
  round: number
  participant: Participant
  slots: WheelSlot[]
  resultIndex: number
}

interface EventState {
  participants: Participant[]
  prizes: Prize[]
  history: DrawHistoryEntry[]
  config: EventConfig
  pendingDraw: PendingDraw | null

  setParticipantsFromText: (raw: string) => void
  setPrizesFromText: (raw: string) => void

  updateConfig: (changes: Partial<EventConfig>) => void

  startEvent: () => void
  startDraw: () => boolean
  commitPendingDraw: () => void
  resetAll: () => void
}

const initialConfig: EventConfig = {
  eliminateOnLose: false,
  manualParticipantSelection: false,
  spinSpeed: 'NORMAL',
  soundEnabled: true,
  theme: 'default',
  status: 'SETUP',
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      participants: [],
      prizes: [],
      history: [],
      config: initialConfig,
      pendingDraw: null,

      setParticipantsFromText: (raw) => {
        const names = parseParticipantLines(raw)
        const now = new Date().toISOString()
        set({
          participants: names.map((displayName) => ({
            id: crypto.randomUUID(),
            displayName,
            status: 'ELIGIBLE',
            createdAt: now,
            resultAt: null,
          })),
        })
      },

      setPrizesFromText: (raw) => {
        const entries = parsePrizeLines(raw)
        const now = new Date().toISOString()
        set({
          prizes: entries.map(({ name, quantity }) => ({
            id: crypto.randomUUID(),
            name,
            initialQuantity: quantity,
            remainingQuantity: quantity,
            createdAt: now,
          })),
        })
      },

      updateConfig: (changes) => {
        set((state) => ({ config: { ...state.config, ...changes } }))
      },

      startEvent: () => {
        const { participants, prizes } = get()
        if (participants.length === 0 || prizes.length === 0) return
        set((state) => ({ config: { ...state.config, status: 'IN_PROGRESS' } }))
      },

      startDraw: () => {
        const { config, participants, prizes, history, pendingDraw } = get()
        if (config.status !== 'IN_PROGRESS' || pendingDraw !== null) return false

        const eligible = participants.filter((p) => p.status === 'ELIGIBLE')
        const participant = pickParticipant(eligible)
        if (!participant) return false

        const slots = computeWheelSlots(prizes)
        const outcome = spinWheel(slots)

        set({
          pendingDraw: {
            round: history.length + 1,
            participant,
            slots,
            resultIndex: outcome.index,
          },
        })
        return true
      },

      commitPendingDraw: () => {
        const { pendingDraw, config } = get()
        if (!pendingDraw) return

        const slot = pendingDraw.slots[pendingDraw.resultIndex]
        const now = new Date().toISOString()
        const isPrize = slot.kind === 'PRIZE'

        set((state) => {
          const participants = state.participants.map((p) => {
            if (p.id !== pendingDraw.participant.id) return p
            if (isPrize) return { ...p, status: 'WINNER' as const, resultAt: now }
            if (config.eliminateOnLose) return { ...p, status: 'ELIMINATED' as const, resultAt: now }
            return p
          })

          const prizes = isPrize
            ? state.prizes.map((p) =>
                p.id === slot.prizeId
                  ? { ...p, remainingQuantity: Math.max(0, p.remainingQuantity - 1) }
                  : p,
              )
            : state.prizes

          const historyEntry: DrawHistoryEntry = {
            id: crypto.randomUUID(),
            round: pendingDraw.round,
            participantId: pendingDraw.participant.id,
            participantName: pendingDraw.participant.displayName,
            resultType: isPrize ? 'PRIZE' : 'LOSE',
            prizeId: isPrize ? slot.prizeId : null,
            prizeName: isPrize ? slot.prizeName : null,
            createdAt: now,
          }

          const allPrizesGone = prizes.every((p) => p.remainingQuantity === 0)
          const noEligibleLeft = participants.every((p) => p.status !== 'ELIGIBLE')
          const status = allPrizesGone || noEligibleLeft ? 'COMPLETED' : state.config.status

          return {
            participants,
            prizes,
            history: [...state.history, historyEntry],
            config: { ...state.config, status },
            pendingDraw: null,
          }
        })
      },

      resetAll: () => {
        set({ participants: [], prizes: [], history: [], config: initialConfig, pendingDraw: null })
      },
    }),
    {
      name: 'lucky-draw-event',
      // pendingDraw is in-flight, pre-commit state tied to a live spin
      // animation; never persist it, so a refresh mid-spin cleanly drops the
      // uncommitted round instead of resuming a stuck disabled draw button.
      partialize: (state) => {
        const { pendingDraw: _pendingDraw, ...rest } = state
        return rest
      },
    },
  ),
)
