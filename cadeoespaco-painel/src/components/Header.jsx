const sel = 'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function Header({ periodo, onPeriodo, linha, onLinha, periodos, linhas }) {
  return (
    <header className="sticky top-0 z-20 bg-blue-700 text-white shadow">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold">
          🚌 CadêOEspaço <span className="font-normal opacity-80">· Painel da Empresa</span>
        </h1>
        <div className="flex gap-2 text-gray-800">
          <select className={sel} value={periodo} onChange={(e) => onPeriodo(e.target.value)} aria-label="Período">
            {periodos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <select className={sel} value={linha} onChange={(e) => onLinha(e.target.value)} aria-label="Linha">
            <option value="Todas">Todas</option>
            {linhas.map((l) => <option key={l.id} value={l.id}>{l.id} · {l.nome}</option>)}
          </select>
        </div>
      </div>
    </header>
  )
}
