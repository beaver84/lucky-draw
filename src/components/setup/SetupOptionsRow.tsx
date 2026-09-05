import { useEventStore } from '../../store/eventStore'

export function SetupOptionsRow() {
  const eliminateOnLose = useEventStore((s) => s.config.eliminateOnLose)
  const manualParticipantSelection = useEventStore((s) => s.config.manualParticipantSelection)
  const updateConfig = useEventStore((s) => s.updateConfig)

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={eliminateOnLose}
          onChange={(e) => updateConfig({ eliminateOnLose: e.target.checked })}
        />
        꽝도 1회만 (꽝이면 즉시 제외)
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={manualParticipantSelection}
          onChange={(e) => updateConfig({ manualParticipantSelection: e.target.checked })}
        />
        참가자 수동 선택
      </label>
    </div>
  )
}
