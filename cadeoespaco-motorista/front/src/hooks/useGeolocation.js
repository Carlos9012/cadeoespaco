import { useState, useEffect, useRef } from 'react'

export function useGeolocation(ativo) {
  const [posicao, setPosicao] = useState(null)
  const [erro, setErro] = useState(null)
  const [status, setStatus] = useState('idle')
  const watchRef = useRef(null)

  useEffect(() => {
    if (!ativo) {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
      }
      setStatus('idle')
      return
    }

    if (!('geolocation' in navigator)) {
      setErro('Geolocalização não suportada')
      setStatus('erro')
      return
    }

    setStatus('carregando')
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosicao({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisao: pos.coords.accuracy,
          velocidade: pos.coords.speed ? pos.coords.speed * 3.6 : 0,
          timestamp: pos.timestamp,
        })
        setStatus('ativo')
        setErro(null)
      },
      (err) => { setErro(err.message); setStatus('erro') },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    return () => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
      }
    }
  }, [ativo])

  return { posicao, erro, status }
}