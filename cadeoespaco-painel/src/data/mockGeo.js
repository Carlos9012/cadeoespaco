// Coordenadas aproximadas e reais de Fortaleza/CE
// Quando o back-end Python estiver pronto, estes dados virão do PostGIS
// TODO: GET /api/linhas/:id/geometria  →  retorna GeoJSON com o traçado

export const ROTAS = {
  L1: [
    [-3.7442, -38.5588], // Terminal Parangaba
    [-3.7520, -38.5450], // Av. João Pessoa
    [-3.7650, -38.5350], // Av. Aguanambi
    [-3.7900, -38.5100], // Av. Washington Soares
    [-3.8290, -38.4890], // Terminal Messejana
  ],
  L2: [
    [-3.7320, -38.5950], // Terminal Antônio Bezerra
    [-3.7320, -38.5700], // Av. Bezerra de Menezes
    [-3.7300, -38.5500], // Av. Sargento Hermínio
    [-3.7270, -38.5260], // Praça da Sé (Centro)
  ],
  L3: [
    [-3.7410, -38.5010], // Aldeota
    [-3.7420, -38.4850], // Av. Santos Dumont
    [-3.7450, -38.4700], // Papicu
  ],
  L4: [
    [-3.8290, -38.4890], // Terminal Messejana
    [-3.7900, -38.5100], // Av. Washington Soares
    [-3.7650, -38.5350], // Av. Aguanambi
    [-3.7270, -38.5260], // Centro
  ],
  L5: [
    [-3.7500, -38.6200], // Conjunto Ceará
    [-3.7320, -38.5800], // Av. Sargento Hermínio
    [-3.7320, -38.5600], // Av. Bezerra de Menezes
    [-3.7270, -38.5260], // Centro
  ],
}

// Pontos críticos (trechos com maior concentração de superlotação)
// TODO: GET /api/lotacao/trechos-criticos?formato=geo
export const PONTOS_CRITICOS = [
  { id: 1, linha: 'L1', lat: -3.7520, lng: -38.5450, indice: 2.9, relatos: 312, nome: 'Av. João Pessoa' },
  { id: 2, linha: 'L1', lat: -3.7650, lng: -38.5350, indice: 2.5, relatos: 190, nome: 'Av. Aguanambi' },
  { id: 3, linha: 'L4', lat: -3.7900, lng: -38.5100, indice: 2.6, relatos: 268, nome: 'Av. Washington Soares' },
  { id: 4, linha: 'L5', lat: -3.7320, lng: -38.5800, indice: 2.4, relatos: 221, nome: 'Av. Sargento Hermínio' },
  { id: 5, linha: 'L2', lat: -3.7320, lng: -38.5700, indice: 2.1, relatos: 143, nome: 'Av. Bezerra de Menezes' },
]

// Centro inicial do mapa (Fortaleza) e zoom
export const CENTRO_FORTALEZA = [-3.7550, -38.5350]
export const ZOOM_INICIAL = 12

// Mapeia id → cor (mesma paleta do dashboard)
export const CORES_LINHA = {
  L1: '#2563eb',
  L2: '#7c3aed',
  L3: '#0891b2',
  L4: '#db2777',
  L5: '#65a30d',
}
