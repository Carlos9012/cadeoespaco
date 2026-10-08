import { useEffect } from 'react'

export default function Toast({ mensagem, tipo = 'sucesso', onFechar }) {
  useEffect(() => {
    const t = setTimeout(() => onFechar?.(), 2500)
    return () => clearTimeout(t)
  }, [mensagem, onFechar])

  const cores = { sucesso: 'bg-emerald-600', erro: 'bg-red-600', info: 'bg-blue-600' }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className={`${cores[tipo]} text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg`}>
        {mensagem}
      </div>
    </div>
  )
}