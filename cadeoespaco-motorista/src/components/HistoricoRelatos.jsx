import { NIVEIS_LOTACAO } from '../data/mockData'
import { formatarHoraCurta } from '../utils/formatters'

export default function HistoricoRelatos({ relatos }) {
  if (!relatos.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-center">
        <p className="text-xs text-slate-400">Nenhum relato ainda nesta viagem</p>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Histórico desta viagem</p>
        <p className="text-xs text-slate-400">{relatos.length} relatos</p>
      </div>
      <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
        {relatos.slice().reverse().map((r) => {
          const nivel = NIVEIS_LOTACAO.find((n) => n.valor === r.nivel)
          return (
            <li key={r.id} className="px-4 py-2.5 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: nivel?.cor }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{nivel?.label}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}</p>
              </div>
              <span className="text-xs text-slate-500 font-mono shrink-0">{formatarHoraCurta(r.timestamp)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}