// Refere-se à Seção 3.7 — Análise e visualização dos dados (indicadores-chave).
// Props: kpis { totalRelatos, indiceMedio, pctSuperlotadas, linhasCriticas, latencia }
import { corSeveridade } from '../data/mockData'

export default function KpiCards({ kpis }) {
  const itens = [
    { t: 'Total de relatos', v: kpis.totalRelatos.toLocaleString('pt-BR'), c: '#2563eb' },
    { t: 'Índice médio (0–3)', v: kpis.indiceMedio.toFixed(2), c: corSeveridade(kpis.indiceMedio) },
    { t: 'Viagens superlotadas', v: `${kpis.pctSuperlotadas}%`, c: '#ef4444' },
    { t: 'Linhas críticas', v: kpis.linhasCriticas, c: '#f97316' },
    { t: 'Latência média', v: `${kpis.latencia} s`, c: '#0891b2' },
  ]
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {itens.map((k) => (
        <div key={k.t} className="rounded-xl bg-white p-4 shadow-sm" style={{ borderTop: `4px solid ${k.c}` }}>
          <p className="text-xs text-gray-500">{k.t}</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: k.c }}>{k.v}</p>
        </div>
      ))}
    </section>
  )
}
