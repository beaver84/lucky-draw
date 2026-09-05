import { ParticipantPanel } from '../components/setup/ParticipantPanel'
import { PrizePanel } from '../components/setup/PrizePanel'
import { SetupOptionsRow } from '../components/setup/SetupOptionsRow'
import { EventOptions } from '../components/setup/EventOptions'
import { StartSummary } from '../components/setup/StartSummary'

export function SetupPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">럭키드로우 추첨 원판</h1>
        <p className="mt-1 text-sm text-slate-500">
          참가자와 경품을 입력하고 원판을 돌려 당첨자를 정합니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded border border-slate-200 bg-white p-4">
          <ParticipantPanel />
        </section>

        <section className="rounded border border-slate-200 bg-white p-4">
          <PrizePanel />
        </section>
      </div>

      <section className="rounded border border-slate-200 bg-white p-4">
        <SetupOptionsRow />
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <EventOptions />
      </section>

      <StartSummary />
    </div>
  )
}
