import { ParticipantInput } from '../components/setup/ParticipantInput'
import { ParticipantList } from '../components/setup/ParticipantList'
import { PrizeInput } from '../components/setup/PrizeInput'
import { PrizeList } from '../components/setup/PrizeList'
import { EventOptions } from '../components/setup/EventOptions'
import { StartSummary } from '../components/setup/StartSummary'

export function SetupPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800">행사 설정</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded border border-slate-200 bg-white p-4">
          <ParticipantInput />
          <ParticipantList />
        </section>

        <section className="space-y-4 rounded border border-slate-200 bg-white p-4">
          <PrizeInput />
          <PrizeList />
        </section>
      </div>

      <section className="rounded border border-slate-200 bg-white p-4">
        <EventOptions />
      </section>

      <StartSummary />
    </div>
  )
}
