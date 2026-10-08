import { formatarDuracao } from '../utils/formatters'

export default function TimerReporte({ segundos, restantes, alerta, intervaloMin }) {
  const percentual = Math.min(100, (segundos / (intervaloMin * 60)) * 100)
  const corBarra = alerta ? 'bg-red-500' : percentual > 75 ? 'bg-orange-500' : percentual > 50 ? 'bg-amber-500' : 'bg-blue-500'

  return (
    <div className={`bg-white rounded-xl shadow-sm p-3 transition-colors ${alerta ? 'ring-2 ring-red-400 animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-700">{alerta ? '⚠️ Hora de reportar!' : 'Próximo lembrete em'}</p>
        <p className={`text-sm font-bold font-mono ${alerta ? 'text-red-600' : 'text-slate-800'}`}>
          {alerta ? '00:00' : formatarDuracao(restantes)}
        </p>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${corBarra} transition-all duration-500`} style={{ width: `${percentual}%` }} />
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5">Último reporte há {formatarDuracao(segundos)}</p>
    </div>
  )
}