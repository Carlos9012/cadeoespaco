import { corHeat, CORES_HEAT } from '../data/mockData'

export default function HeatmapTable({ data, linhas }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Mapa de calor · Hora × Linha</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5 text-[10px]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white pr-2 text-left font-medium text-gray-500">Linha</th>
              {data.map((d) => <th key={d.hora} className="font-medium text-gray-500">{d.hora}</th>)}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.id}>
                <td className="sticky left-0 whitespace-nowrap bg-white pr-2 text-xs font-medium">{l.id}</td>
                {data.map((d) => (
                  <td
                    key={d.hora}
                    title={`${l.id} · ${d.hora} · índice ${d[l.id].toFixed(2)}`}
                    className="h-7 min-w-[26px] rounded text-center"
                    style={{ background: corHeat(d[l.id]) }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-500">
        <span>Baixa</span>
        {CORES_HEAT.map((c) => <span key={c} className="h-3 w-6 rounded" style={{ background: c }} />)}
        <span>Alta</span>
      </div>
    </div>
  )
}
