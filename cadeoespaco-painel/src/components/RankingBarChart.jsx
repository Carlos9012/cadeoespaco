import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { corSeveridade, rotuloDe } from '../data/mockData'

export default function RankingBarChart({ data }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Comparação entre linhas</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" domain={[0, 3]} ticks={[0, 1, 2, 3]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="nome" width={130} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v} (${rotuloDe(v)})`, 'Índice médio']} />
            <Bar dataKey="indice" radius={[0, 4, 4, 0]}>
              {data.map((d) => <Cell key={d.id} fill={corSeveridade(d.indice)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
