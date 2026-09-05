import { useEventStore } from '../../store/eventStore'

export function EventOptions() {
  const config = useEventStore((s) => s.config)
  const updateConfig = useEventStore((s) => s.updateConfig)

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">추가 옵션</h3>

      <label className="flex items-center justify-between text-sm">
        <span>결과 공개 효과음</span>
        <input
          type="checkbox"
          checked={config.soundEnabled}
          onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
        />
      </label>

      <label className="flex items-center justify-between text-sm">
        <span>추첨 속도</span>
        <select
          value={config.spinSpeed}
          onChange={(e) => updateConfig({ spinSpeed: e.target.value as typeof config.spinSpeed })}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="SLOW">느리게</option>
          <option value="NORMAL">보통</option>
          <option value="FAST">빠르게</option>
        </select>
      </label>

      <label className="flex items-center justify-between text-sm">
        <span>원판 색상 테마</span>
        <select
          value={config.theme}
          onChange={(e) => updateConfig({ theme: e.target.value as typeof config.theme })}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="default">기본 테마</option>
          <option value="high-contrast">고대비 테마</option>
        </select>
      </label>
    </div>
  )
}
