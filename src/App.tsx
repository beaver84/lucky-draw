import { useEventStore } from './store/eventStore'
import { SetupPage } from './pages/SetupPage'
import { DrawPage } from './pages/DrawPage'

function App() {
  const status = useEventStore((s) => s.config.status)

  return (
    <div className="min-h-screen bg-slate-50">
      {status === 'SETUP' ? <SetupPage /> : <DrawPage />}
    </div>
  )
}

export default App
