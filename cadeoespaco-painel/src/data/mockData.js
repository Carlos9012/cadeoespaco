export const LINHAS = [
  { id: 'L1', nome: 'Parangaba/Messejana', cor: '#2563eb' },
  { id: 'L2', nome: 'Centro/Antônio Bezerra', cor: '#7c3aed' },
  { id: 'L3', nome: 'Aldeota/Papicu', cor: '#0891b2' },
  { id: 'L4', nome: 'Messejana/Centro', cor: '#db2777' },
  { id: 'L5', nome: 'Conjunto Ceará/Centro', cor: '#65a30d' },
]

export const PERIODOS = [
  { id: 'hoje', nome: 'Hoje' },
  { id: '7d', nome: 'Últimos 7 dias' },
  { id: '30d', nome: 'Últimos 30 dias' },
]

// Categorias reportadas pelo passageiro:
export const ROTULOS = ['Vazio', 'Lugares', 'Lotado', 'Superlot.']

// Escala de severidade (barras, listas)
export function corSeveridade(indice) {
  if (indice >= 2.5) return '#dc2626'; // superlotado - vermelho
  if (indice >= 2.0) return '#f97316'; // lotado - laranja
  if (indice >= 1.5) return '#fbbf24'; // atenção - amarelo
  if (indice >= 1.0) return '#84cc16'; // ok - verde-limão
  return '#10b981';                    // vazio - verde
}

// Retorna o rótulo textual do índice (ex: 2 → "Lotado")
export function rotuloDe(indice) {
  const valor = Math.round(indice);
  const labels = ['Vazio', 'Lugares disponíveis', 'Lotado', 'Superlotado'];
  return labels[valor] ?? '—';
}

// 6 tons para o heatmap
export const CORES_HEAT = ['#86efac', '#bef264', '#fde047', '#fdba74', '#fb923c', '#ef4444']
export const corHeat = (v) => CORES_HEAT[[0.5, 1, 1.5, 2, 2.5].filter((t) => v >= t).length]

export const HORAS = Array.from({ length: 19 }, (_, i) => i + 5) // 05h..23h
const fmtHora = (h) => `${String(h).padStart(2, '0')}h`

// Perfil base 05h..23h: picos em 07-08h e 17-19h
const PERFIL = [0.5, 1, 2.2, 2.5, 1.5, 1, 1.1, 1.4, 1.3, 1, 1.1, 1.5, 2.3, 2.6, 2, 1.3, 0.8, 0.6, 0.4]
// [fator, offset] por linha — L1 é consistentemente crítica
const FATOR = { L1: [1.5, 0.6], L2: [0.8, 0.2], L3: [0.55, 0.1], L4: [1.25, 0.3], L5: [1, 0.3] }
const ESCALA = { hoje: 1, '7d': 0.97, '30d': 0.94 }

// TODO: GET /api/lotacao/agregada?periodo=hoje&linha=L1
export function getSerie(periodo, linha) {
  const ids = linha === 'Todas' ? LINHAS.map((l) => l.id) : [linha]
  return HORAS.map((h, k) => {
    const row = { hora: fmtHora(h) }
    ids.forEach((id) => {
      const i = LINHAS.findIndex((l) => l.id === id)
      const [f, o] = FATOR[id]
      const ruido = (((h * 7 + i * 13) % 5) - 2) * 0.06 // ruído determinístico
      row[id] = +Math.min(3, Math.max(0, (PERFIL[k] * f + o + ruido) * ESCALA[periodo])).toFixed(2)
    })
    return row
  })
}

const RANKING_BASE = [
  { id: 'L1', indice: 2.62, relatosDia: 420 },
  { id: 'L4', indice: 2.18, relatosDia: 360 },
  { id: 'L5', indice: 1.74, relatosDia: 280 },
  { id: 'L2', indice: 1.31, relatosDia: 310 },
  { id: 'L3', indice: 0.86, relatosDia: 190 },
]
const FATOR_RELATOS = { hoje: 1, '7d': 6.4, '30d': 26 }
const LATENCIA = { hoje: 4.2, '7d: ': 0, '7d': 3.8, '30d': 3.5 }

// TODO: GET /api/lotacao/ranking?periodo=...
export function getRanking(periodo, linha) {
  return RANKING_BASE.filter((r) => linha === 'Todas' || r.id === linha)
    .map((r) => ({
      ...r,
      nome: LINHAS.find((l) => l.id === r.id).nome,
      relatos: Math.round(r.relatosDia * FATOR_RELATOS[periodo]),
    }))
    .sort((a, b) => b.indice - a.indice)
}

// TODO: GET /api/lotacao/agregada (KPIs virão do mesmo endpoint ou de /api/kpis)
export function getKpis(periodo, linha) {
  const rank = getRanking(periodo, linha)
  const serie = getSerie(periodo, linha)
  const celulas = serie.flatMap((r) => Object.entries(r).filter(([k]) => k !== 'hora').map(([, v]) => v))
  return {
    totalRelatos: rank.reduce((s, r) => s + r.relatos, 0),
    indiceMedio: +(rank.reduce((s, r) => s + r.indice, 0) / rank.length).toFixed(2),
    pctSuperlotadas: +((celulas.filter((v) => v >= 2.5).length / celulas.length) * 100).toFixed(1),
    linhasCriticas: rank.filter((r) => r.indice >= 2).length,
    latencia: LATENCIA[periodo],
  }
}

const TRECHOS = [
  { linha: 'L1', trecho: 'Terminal Parangaba → Av. João Pessoa', indice: 2.9, relatos: 312 },
  { linha: 'L4', trecho: 'Terminal Messejana → Av. Washington Soares', indice: 2.6, relatos: 268 },
  { linha: 'L1', trecho: 'Terminal Parangaba → Av. Aguanambi', indice: 2.5, relatos: 190 },
  { linha: 'L5', trecho: 'Conjunto Ceará → Av. Bezerra de Menezes', indice: 2.4, relatos: 221 },
  { linha: 'L2', trecho: 'Antônio Bezerra → Praça da Sé', indice: 2.1, relatos: 143 },
]
// TODO: GET /api/lotacao/trechos-criticos?periodo=...
export const getTrechos = (periodo, linha) =>
  TRECHOS.filter((t) => linha === 'Todas' || t.linha === linha)

const RECOMENDACOES = [
  {
    id: 1, linha: 'L1', prioridade: 'alta',
    titulo: 'Reforço de frota no pico da tarde',
    descricao: 'Previsão (Prophet) indica índice médio de 2,9 entre 17h e 19h nos próximos 7 dias; 78% dos relatos nesse intervalo são "Superlotado".',
    impacto: 'Redução estimada de 30% nos relatos de superlotação no pico.',
    acao: 'Adicionar 3 veículos entre 17h e 19h em dias úteis.',
  },
  {
    id: 2, linha: 'L4', prioridade: 'alta',
    titulo: 'Criar linha expressa Messejana–Centro',
    descricao: 'Clusterização (DBSCAN) revelou concentração de embarques em 4 paradas, com demanda pendular forte.',
    impacto: 'Alívio de ~20% da carga na linha regular e menor tempo de viagem.',
    acao: 'Piloto de 30 dias com expresso saindo do terminal às 6h–8h.',
  },
  {
    id: 3, linha: 'L5', prioridade: 'média',
    titulo: 'Ajustar grade horária da manhã',
    descricao: 'Intervalo de 18 min entre 6h e 7h coincide com pico crescente de lotação (índice 2,4).',
    impacto: 'Distribuição mais uniforme da demanda entre partidas.',
    acao: 'Reduzir intervalo para 10 min entre 6h e 8h30.',
  },
  {
    id: 4, linha: 'L2', prioridade: 'baixa',
    titulo: 'Realocar frota no entrepico',
    descricao: 'Índice abaixo de 1,2 entre 10h e 15h, com ociosidade recorrente.',
    impacto: 'Economia operacional estimada de 8% sem perda de nível de serviço.',
    acao: 'Realocar 2 veículos para a linha L1 no entrepico.',
  },
]
// TODO: GET /api/recomendacoes
export const getRecomendacoes = (linha) =>
  RECOMENDACOES.filter((r) => linha === 'Todas' || r.linha === linha)
