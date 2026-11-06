import { corHeat } from '../data/mockData';

export default function HeatmapTable({ data, linhas }) {
  // Se não houver dados gerais, não renderiza a tabela
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-slate-400">
        Sem dados para o mapa de calor neste período.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Mapa de calor · hora × linha</h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="text-left p-1 text-slate-500 font-medium">Linha</th>
            {data.map((row) => (
              <th key={row.hora} className="p-1 text-slate-500 font-medium text-center min-w-[32px]">
                {row.hora.replace('h', '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id}>
              <td className="p-1 text-slate-700 font-medium whitespace-nowrap">
                {l.codigo || l.id}
              </td>
              {data.map((row, idx) => {
                // Pega o valor. Se não existir, será undefined
                const valor = row[l.id];
                // Verifica se é um número válido
                const temDados = typeof valor === 'number';

                return (
                  <td key={`${l.id}-${idx}`} className="p-0.5">
                    <div
                      className="w-6 h-6 rounded-sm mx-auto hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: temDados ? corHeat(valor) : '#f1f5f9',
                        color: temDados && valor >= 2 ? '#fff' : '#64748b'
                      }}
                      title={`${l.codigo || l.id} · ${row.hora} · ${temDados ? valor.toFixed(2) : 'Sem dados'}`}
                    >
                      {/* Mostra o valor arredondado ou um traço se não houver dados */}
                      {temDados ? valor.toFixed(1) : '-'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legenda */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
        <span>Vazio</span>
        <div className="flex">
          {['#86efac', '#bef264', '#fde047', '#fdba74', '#fb923c', '#ef4444'].map((c) => (
            <div key={c} className="w-5 h-4" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span>Superlotado</span>
      </div>
    </div>
  );
}
