import { NIVEIS_LOTACAO } from '../data/mockData'
import { formatarHora } from '../utils/formatters'

export default function ResumoViagem({ viagem, relatos, onNovaViagem }) {
  const contagem = NIVEIS_LOTACAO.map((n) => ({ ...n, qtd: relatos.filter((r) => r.nivel === n.valor).length }))
  const duracao = relatos.length > 1 ? Math.round((relatos[relatos.length - 1].timestamp - relatos[0].timestamp) / 60000) : 0

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-5 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
        <h2 className="text-lg font-bold text-slate-800">Viagem encerrada</h2>
        <p className="text-xs text-slate-500 mt-1">{viagem.linha.codigo} · Carro {viagem.veiculo.numeroCarro}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-slate-500">Relatos enviados</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{relatos.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-slate-500">Duração</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{duracao}<span className="text-sm font-medium text-slate-500 ml-1">min</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Distribuição de lotação</p>
        <div className="space-y-3">
          {contagem.map((c) => {
            const pct = relatos.length ? (c.qtd / relatos.length) * 100 : 0
            return (
              <div key={c.valor}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{c.label}</span>
                  <span className="text-slate-500">{c.qtd} · {pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.cor }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {relatos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Primeiro e último relato</p>
          <div className="flex justify-between text-xs text-slate-600">
            <span>🕐 {formatarHora(relatos[0].timestamp)}</span>
            <span>🕐 {formatarHora(relatos[relatos.length - 1].timestamp)}</span>
          </div>
        </div>
      )}

      <button onClick={onNovaViagem} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md active:bg-blue-700">
        Iniciar nova viagem
      </button>
    </div>
  )
}