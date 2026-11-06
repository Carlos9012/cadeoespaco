const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getLinhas: async () => {
    const data = await fetchAPI('/linhas');
    // Adiciona cores fixas para as linhas (já que o back não envia cor ainda)
    const CORES = { L1: '#2563eb', L2: '#7c3aed', L3: '#0891b2', L4: '#db2777', L5: '#65a30d' };
    return data.map(l => ({ ...l, cor: CORES[l.id] || '#64748b' }));
  },

  getKpis: async (periodo, linha) => {
    const data = await fetchAPI(`/kpis?periodo=${periodo}&linha=${linha}`);
    // Adapta snake_case do Python para camelCase do React
    return {
      totalRelatos: data.total_relatos,
      indiceMedio: data.indice_medio,
      pctSuperlotadas: data.pct_superlotado,
      linhasCriticas: data.linhas_criticas,
      latencia: data.latencia_segundos,
    };
  },

  getSerie: async (periodo, linha) => {
    return fetchAPI(`/lotacao/agregada?periodo=${periodo}&linha=${linha}`);
  },

  getRanking: async (periodo, linha) => {
    return fetchAPI(`/lotacao/ranking?periodo=${periodo}&linha=${linha}`);
  },

  getTrechos: async (periodo, linha) => {
    const data = await fetchAPI(`/lotacao/trechos-criticos?periodo=${periodo}&linha=${linha}`);
    // O back-end retorna lat/lng, mas o front espera um nome de trecho.
    // Criamos um nome provisório formatado.
    return data.map(t => ({
      ...t,
      trecho: `Zona Crítica (${t.lat.toFixed(3)}, ${t.lng.toFixed(3)})`
    }));
  },

  getRecomendacoes: async (linha) => {
    return fetchAPI(`/recomendacoes?linha=${linha}`);
  }
};
