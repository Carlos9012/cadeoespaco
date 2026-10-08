// Refere-se à Seção 3.7 — Análise e visualização dos dados (composição do painel).
import { useState } from 'react'
import Header from './components/Header'
import KpiCards from './components/KpiCards'
import LotacaoLineChart from './components/LotacaoLineChart'
import RankingBarChart from './components/RankingBarChart'
import HeatmapTable from './components/HeatmapTable'
import TrechosCriticos from './components/TrechosCriticos'
import RecomendacoesIA from './components/RecomendacoesIA'
import MapaLotacao from './components/MapaLotacao'
import {
  LINHAS,
  PERIODOS,
  getSerie,
  getRanking,
  getKpis,
  getTrechos,
  getRecomendacoes,
} from './data/mockData'

export default function App() {
  const [periodo, setPeriodo] = useState('hoje')
  const [linha, setLinha] = useState('Todas')

  // Dados derivados — recalculados sempre que periodo/linha mudam
  const linhasVisiveis = LINHAS.filter((l) => linha === 'Todas' || l.id === linha)
  const serie = getSerie(periodo, linha)

  return (
    <div className="min-h-screen">
      {/* Cabeçalho com filtros globais */}
      <Header
        periodo={periodo}
        onPeriodo={setPeriodo}
        linha={linha}
        onLinha={setLinha}
        periodos={PERIODOS}
        linhas={LINHAS}
      />

      <main className="mx-auto max-w-7xl space-y-4 p-4">
        {/* 1. KPIs consolidados — Seção 3.7 (indicadores de acompanhamento) */}
        <KpiCards kpis={getKpis(periodo, linha)} />

        {/* 2. Mapa interativo — Seção 3.7 (heatmaps geográficos / trechos críticos) */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Mapa de lotação
              </h2>
              <p className="text-xs text-slate-500">
                Traçado das linhas colorido pelo índice médio · pontos críticos proporcionais aos relatos
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {linha === 'Todas' ? 'Todas as linhas' : `Linha ${linha}`}
            </span>
          </div>
          <MapaLotacao linhaFiltro={linha} serie={serie} />
        </section>

        {/* 3. Série temporal + Ranking lado a lado */}
        <div className="grid gap-4 lg:grid-cols-2">
          <LotacaoLineChart data={serie} linhas={linhasVisiveis} />
          <RankingBarChart data={getRanking(periodo, linha)} />
        </div>

        {/* 4. Heatmap hora × linha (largura total) */}
        <HeatmapTable data={serie} linhas={linhasVisiveis} />

        {/* 5. Trechos críticos + Recomendações lado a lado */}
        <div className="grid gap-4 lg:grid-cols-2">
          <TrechosCriticos trechos={getTrechos(periodo, linha)} />
          <RecomendacoesIA recomendacoes={getRecomendacoes(linha)} />
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        CadêOEspaço · Painel da Empresa ·{' '}
        {linha === 'Todas' ? 'Todas as linhas' : `Linha ${linha}`} ·{' '}
        {PERIODOS.find((p) => p.id === periodo)?.nome}
      </footer>
    </div>
  )
}
