import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ROTULOS, rotuloDe } from '../data/mockData'

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-white p-2 text-xs shadow">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(2)} ({rotuloDe(p.value)})
        </p>
      ))}
    </div>
  )
}

export default function LotacaoLineChart({ data, linhas }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Lotação ao longo do dia</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tickFormatter={(v) => ROTULOS[v]} width={62} tick={{ fontSize: 11 }} />
            <Tooltip content={<TooltipCustom />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {linhas.map((l) => (
              <Line key={l.id} type="monotone" dataKey={l.id} name={l.nome} stroke={l.cor} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
