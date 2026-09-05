import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DrawHistoryEntry,
  EventConfig,
  Participant,
  Prize,
} from '../types'
import { resolveNewParticipants } from '../domain/participants'
import { isValidPrizeQuantity, upsertPrize, type PrizeInput } from '../domain/prizes'
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

  addParticipants: (rawValues: string[]) => { duplicateCount: number; emptyCount: number }
  removeParticipant: (id: string) => void
  clearParticipants: () => void

  addPrize: (input: PrizeInput) => boolean
  updatePrize: (id: string, changes: { name?: string; initialQuantity?: number }) => void
  removePrize: (id: string) => void

  updateConfig: (changes: Partial<EventConfig>) => void

  startEvent: () => void
  startDraw: () => boolean
  commitPendingDraw: () => void
  resetAll: () => void
}

const initialConfig: EventConfig = {
  eliminateOnLose: false,
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

      addParticipants: (rawValues) => {
        const { added, duplicateCount, emptyCount } = resolveNewParticipants(
          rawValues,
          get().participants,
        )
        const now = new Date().toISOString()
        const newParticipants: Participant[] = added.map((displayName) => ({
          id: crypto.randomUUID(),
          displayName,
          status: 'ELIGIBLE',
          createdAt: now,
          resultAt: null,
        }))
        set((state) => ({ participants: [...state.participants, ...newParticipants] }))
        return { duplicateCount, emptyCount }
      },

      removeParticipant: (id) => {
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        }))
      },

      clearParticipants: () => set({ participants: [] }),

      addPrize: (input) => {
        if (!isValidPrizeQuantity(input.quantity)) return false
        const now = new Date().toISOString()
        set((state) => ({
          prizes: upsertPrize(state.prizes, input, () => ({
            id: crypto.randomUUID(),
            name: input.name,
            initialQuantity: input.quantity,
            remainingQuantity: input.quantity,
            createdAt: now,
          })),
        }))
        return true
      },

      updatePrize: (id, changes) => {
        set((state) => ({
          prizes: state.prizes.map((p) => {
            if (p.id !== id) return p
            const initialQuantity = changes.initialQuantity ?? p.initialQuantity
            const delta = initialQuantity - p.initialQuantity
            return {
              ...p,
              name: changes.name ?? p.name,
              initialQuantity,
              remainingQuantity: Math.max(0, p.remainingQuantity + delta),
            }
          }),
        }))
      },

      removePrize: (id) => {
        set((state) => ({ prizes: state.prizes.filter((p) => p.id !== id) }))
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
