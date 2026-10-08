import { corSeveridade } from '../data/mockData'

export default function TrechosCriticos({ trechos }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Trechos mais críticos</h2>
      <ul className="space-y-4">
        {trechos.map((t) => (
          <li key={t.trecho}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span><b>{t.linha}</b> · {t.trecho}</span>
              <span className="whitespace-nowrap text-xs text-gray-500">{t.indice.toFixed(1)} · {t.relatos} relatos</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-gray-200">
              <div className="h-2 rounded-full" style={{ width: `${(t.indice / 3) * 100}%`, background: corSeveridade(t.indice) }} />
            </div>
          </li>
        ))}
        {trechos.length === 0 && <li className="text-sm text-gray-500">Sem trechos críticos.</li>}
      </ul>
    </div>
  )
}
