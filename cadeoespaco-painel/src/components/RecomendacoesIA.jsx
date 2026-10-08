const BADGE = {
  alta: 'bg-red-100 text-red-700',
  média: 'bg-orange-100 text-orange-700',
  baixa: 'bg-green-100 text-green-700',
}

export default function RecomendacoesIA({ recomendacoes }) {
  return (
    <section>
      <h2 className="mb-3 font-semibold">🤖 Recomendações de IA</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {recomendacoes.map((r) => (
          <article key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{r.linha}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[r.prioridade]}`}>
                Prioridade {r.prioridade}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">{r.titulo}</h3>
            <p className="mt-1 text-sm text-gray-600">{r.descricao}</p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-2"><b>📈 Impacto estimado</b><p className="text-gray-600">{r.impacto}</p></div>
              <div className="rounded-lg bg-gray-50 p-2"><b>🛠 Ação sugerida</b><p className="text-gray-600">{r.acao}</p></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
