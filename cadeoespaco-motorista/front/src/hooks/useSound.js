export function useSound() {
  const tocar = (freq = 880, duracaoMs = 250, tipo = 'sine') => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = tipo
      osc.frequency.value = freq
      osc.connect(gain); gain.connect(ctx.destination)
      const agora = ctx.currentTime
      gain.gain.setValueAtTime(0.25, agora)
      gain.gain.exponentialRampToValueAtTime(0.001, agora + duracaoMs / 1000)
      osc.start(agora); osc.stop(agora + duracaoMs / 1000)
      setTimeout(() => ctx.close(), duracaoMs + 100)
    } catch {}
  }
  const tocarSucesso = () => tocar(880, 150)
  const tocarLembrete = () => {
    tocar(660, 180)
    setTimeout(() => tocar(880, 180), 220)
    setTimeout(() => tocar(1100, 220), 440)
  }
  return { tocar, tocarSucesso, tocarLembrete }
}