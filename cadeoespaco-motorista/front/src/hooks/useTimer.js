import { useState, useEffect, useRef } from 'react'

export function useTimer(intervaloMin, ativo, onLembrete) {
  const [segundos, setSegundos] = useState(0)
  const onLembreteRef = useRef(onLembrete)
  const disparadoRef = useRef(false)

  useEffect(() => { onLembreteRef.current = onLembrete }, [onLembrete])

  useEffect(() => {
    if (!ativo) return
    const interval = setInterval(() => {
      setSegundos((s) => {
        const novo = s + 1
        if (novo >= intervaloMin * 60 && !disparadoRef.current) {
          disparadoRef.current = true
          onLembreteRef.current?.()
        }
        return novo
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [ativo, intervaloMin])

  const reset = () => { setSegundos(0); disparadoRef.current = false }
  const restantes = Math.max(0, intervaloMin * 60 - segundos)
  const alerta = disparadoRef.current

  return { segundosDesdeUltimoReporte: segundos, restantes, alerta, reset }
}