import { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import LotacaoLineChart from './components/LotacaoLineChart';
import RankingBarChart from './components/RankingBarChart';
import HeatmapTable from './components/HeatmapTable';
import TrechosCriticos from './components/TrechosCriticos';
import RecomendacoesIA from './components/RecomendacoesIA';
import MapaLotacao from './components/MapaLotacao';
import { PERIODOS } from './data/mockData'; // Mantemos apenas os períodos estáticos
import { api } from './services/api';

export default function App() {
  const [periodo, setPeriodo] = useState('hoje');
  const [linha, setLinha] = useState('Todas');

  // Estados dos dados vindos da API
  const [linhas, setLinhas] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [serie, setSerie] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [trechos, setTrechos] = useState([]);
  const [recomendacoes, setRecomendacoes] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Busca as linhas apenas uma vez ao montar
  useEffect(() => {
    api.getLinhas()
      .then(setLinhas)
      .catch(err => console.error("Erro ao buscar linhas:", err));
  }, []);

  // 2. Busca todos os dados sempre que período ou linha mudarem
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getKpis(periodo, linha),
      api.getSerie(periodo, linha),
      api.getRanking(periodo, linha),
      api.getTrechos(periodo, linha),
      api.getRecomendacoes(linha)
    ])
      .then(([resKpis, resSerie, resRanking, resTrechos, resRecomendacoes]) => {
        if (!isMounted) return;
        setKpis(resKpis);
        setSerie(resSerie);
        setRanking(resRanking);
        setTrechos(resTrechos);
        setRecomendacoes(resRecomendacoes);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(err);
        setError('Não foi possível carregar os dados. O back-end está rodando?');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [periodo, linha]);

  // Filtra as linhas para o gráfico de linhas com base na seleção
  const linhasVisiveis = linhas.filter((l) => linha === 'Todas' || l.id === linha);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        periodo={periodo}
        onPeriodo={setPeriodo}
        linha={linha}
        onLinha={setLinha}
        periodos={PERIODOS}
        linhas={linhas}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full space-y-4 p-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Carregando dados do servidor...</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            {kpis && <KpiCards kpis={kpis} />}

            {/* Mapa */}
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Mapa de lotação</h2>
                  <p className="text-xs text-slate-500">Traçado estático (mock) · Pontos críticos via API</p>
                </div>
              </div>
              <MapaLotacao linhaFiltro={linha} serie={serie} pontosCriticos={trechos} />
            </section>

            {/* Gráficos */}
            <div className="grid gap-4 lg:grid-cols-2">
              <LotacaoLineChart data={serie} linhas={linhasVisiveis} />
              <RankingBarChart data={ranking} />
            </div>

            {/* Heatmap */}
            <HeatmapTable data={serie} linhas={linhasVisiveis} />

            {/* Trechos e Recomendações */}
            <div className="grid gap-4 lg:grid-cols-2">
              <TrechosCriticos trechos={trechos} />
              <RecomendacoesIA recomendacoes={recomendacoes} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
