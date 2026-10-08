// Refere-se à Seção 3.7 — Análise e visualização dos dados (mapas de calor geográficos)
// Visualiza espacialmente o traçado das linhas e os pontos de maior lotação.
// TODO: substituir mockGeo.js por chamada real: GET /api/linhas/:id/geometria

import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ROTAS, PONTOS_CRITICOS, CENTRO_FORTALEZA, ZOOM_INICIAL, CORES_LINHA,
} from '../data/mockGeo'
import { LINHAS } from '../data/mockData'
import { corSeveridade } from '../data/mockData'

export default function MapaLotacao({ linhaFiltro, serie }) {
  const linhasVisiveis = linhaFiltro === 'Todas'
    ? LINHAS
    : LINHAS.filter((l) => l.id === linhaFiltro)

  // Descobre o índice médio da linha para colorir o traçado
  const indiceMedio = (id) => {
    const pontos = serie.map((s) => s[id]).filter((v) => typeof v === 'number')
    if (!pontos.length) return 0
    return pontos.reduce((a, b) => a + b, 0) / pontos.length
  }

  return (
    <div className="h-[520px] rounded-xl overflow-hidden relative">
      <MapContainer
        center={CENTRO_FORTALEZA}
        zoom={ZOOM_INICIAL}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Base do mapa — usamos CartoDB Positron, mais limpo para dados sobrepostos */}
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
        />

        {/* Traçado de cada linha, colorido pela severidade média */}
        {linhasVisiveis.map((linha) => {
          const rota = ROTAS[linha.id]
          if (!rota) return null
          const media = indiceMedio(linha.id)
          const cor = corSeveridade(media)

          return (
            <Polyline
              key={linha.id}
              positions={rota}
              pathOptions={{
                color: cor,
                weight: 6,
                opacity: 0.75,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <strong>{linha.id} · {linha.nome}</strong>
                  <br />
                  Índice médio: <b>{media.toFixed(2)}</b>
                </div>
              </Tooltip>
            </Polyline>
          )
        })}

        {/* Pontos críticos com círculos proporcionais aos relatos */}
        {PONTOS_CRITICOS
          .filter((p) => linhaFiltro === 'Todas' || p.linha === linhaFiltro)
          .map((p) => {
            const cor = corSeveridade(p.indice)
            const raio = 8 + (p.relatos / 60) // tamanho proporcional

            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={raio}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: cor,
                  fillOpacity: 0.85,
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-800">
                      {p.linha} · {p.nome}
                    </div>
                    <div>
                      Índice: <b style={{ color: cor }}>{p.indice.toFixed(1)}</b>
                    </div>
                    <div>Relatos: <b>{p.relatos}</b></div>
                    <div className="text-slate-500">
                      {p.indice >= 2.5 ? '🚨 Superlotado' :
                       p.indice >= 2 ? '⚠️ Lotado' :
                       p.indice >= 1.5 ? '🟡 Atenção' : '✅ OK'}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
      </MapContainer>

      {/* Legenda flutuante sobre o mapa */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md p-3 text-xs space-y-1.5">
        <p className="font-semibold text-slate-700 mb-1">Severidade</p>
        {[
          ['#10b981', 'Vazio / OK'],
          ['#fbbf24', 'Atenção'],
          ['#f97316', 'Lotado'],
          ['#dc2626', 'Superlotado'],
        ].map(([cor, label]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cor }} />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
        <p className="text-slate-400 text-[10px] mt-2">
          Traçado colorido = índice médio da linha
        </p>
      </div>

      {/* Contador no canto superior direito */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-3 py-2 text-xs">
        <p className="text-slate-500">Pontos críticos exibidos</p>
        <p className="text-lg font-bold text-slate-800">
          {PONTOS_CRITICOS.filter((p) => linhaFiltro === 'Todas' || p.linha === linhaFiltro).length}
        </p>
      </div>
    </div>
  )
}
