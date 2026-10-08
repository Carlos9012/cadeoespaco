import { useState, useEffect } from 'react'

export function useLocalStorage(chave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const item = window.localStorage.getItem(chave)
      return item ? JSON.parse(item) : valorInicial
    } catch { return valorInicial }
  })

  useEffect(() => {
    try { window.localStorage.setItem(chave, JSON.stringify(valor)) } catch {}
  }, [chave, valor])

  return [valor, setValor]
}