import { formatarCoordenadas } from '../utils/formatters'

export default function StatusGPS({ posicao, status, erro }) {
  const indicadores = {
    idle: { cor: 'bg-slate-400', label: 'GPS inativo' },
    carregando: { cor: 'bg-amber-400 animate-pulse', label: 'Buscando sinal...' },
    ativo: { cor: 'bg-emerald-500', label: 'GPS ativo' },
    erro: { cor: 'bg-red-500', label: 'Falha no GPS' },
  }
  const ind = indicadores[status] || indicadores.idle

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
      <div className="relative shrink-0">
        <div className={`w-3 h-3 rounded-full ${ind.cor}`} />
        {status === 'ativo' && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-60" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-700">{ind.label}</p>
        <p className="text-[11px] text-slate-500 font-mono truncate">
          {erro ? erro : formatarCoordenadas(posicao?.lat, posicao?.lng, posicao?.precisao)}
        </p>
      </div>
      {posicao?.velocidade > 0 && (
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-slate-700">{Math.round(posicao.velocidade)} km/h</p>
          <p className="text-[10px] text-slate-400">velocidade</p>
        </div>
      )}
    </div>
  )
}