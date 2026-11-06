const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Motorista mockado (quando implementarmos o login JWT, isso virá do token)
const MOTORISTA_ID = "M001";

export const api = {
  getLinhas: async () => {
    const res = await fetch(`${API_URL}/linhas`);
    if (!res.ok) throw new Error('Falha ao buscar linhas');
    return res.json();
  },

  getVeiculos: async (linhaId) => {
    const res = await fetch(`${API_URL}/veiculos?linha_id=${linhaId}`);
    if (!res.ok) throw new Error('Falha ao buscar veículos');
    return res.json();
  },

  enviarRelato: async (dados) => {
    // O backend espera snake_case (nivel_lotacao, linha_id, etc)
    const payload = {
      usuario_id: MOTORISTA_ID,
      veiculo_id: dados.veiculoId,
      linha_id: dados.linhaId,
      nivel_lotacao: dados.nivel,
      latitude: dados.lat,
      longitude: dados.lng,
      velocidade_kmh: dados.velocidade,
      sentido: dados.sentido,
      origem: 'motorista'
    };

    const res = await fetch(`${API_URL}/relatos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Falha ao enviar relato');
    return res.json();
  }
};
