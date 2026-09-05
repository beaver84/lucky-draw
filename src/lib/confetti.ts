import confetti from 'canvas-confetti'

export function celebrateWin(): void {
  const duration = 2500
  const end = Date.now() + duration
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#0ea5e9']

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    })

    if (Date.now() < end) requestAnimationFrame(frame)
  })()

  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.5 },
    colors,
  })
}
