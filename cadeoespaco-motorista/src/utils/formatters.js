export const formatarHora = (ts) =>
  new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const formatarHoraCurta = (ts) =>
  new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const formatarDuracao = (s) => {
  const m = Math.floor(s / 60)
  const seg = s % 60
  return `${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
}

export const formatarCoordenadas = (lat, lng, precisao) => {
  if (lat == null || lng == null) return 'Sem sinal GPS'
  const p = precisao ? ` · ±${Math.round(precisao)}m` : ''
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}${p}`
}