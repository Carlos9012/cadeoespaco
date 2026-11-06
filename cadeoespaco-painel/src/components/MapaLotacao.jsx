import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ROTAS, CENTRO_FORTALEZA, ZOOM_INICIAL } from '../data/mockGeo';
import { corSeveridade } from '../data/mockData';

export default function MapaLotacao({ linhaFiltro, serie, pontosCriticos = [] }) {
  // Filtra as rotas com base na linha selecionada
  const linhasVisiveis = Object.keys(ROTAS).filter(
    (id) => linhaFiltro === 'Todas' || id === linhaFiltro
  );

  // Descobre o índice médio da linha para colorir o traçado
  const indiceMedio = (id) => {
    const pontos = serie.map((s) => s[id]).filter((v) => typeof v === 'number');
    if (!pontos.length) return 0;
    return pontos.reduce((a, b) => a + b, 0) / pontos.length;
  };

  return (
    <div className="h-[520px] rounded-xl overflow-hidden relative">
      <MapContainer
        center={CENTRO_FORTALEZA}
        zoom={ZOOM_INICIAL}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Traçado das linhas (estático do mockGeo por enquanto) */}
        {linhasVisiveis.map((id) => {
          const rota = ROTAS[id];
          const media = indiceMedio(id);
          const cor = corSeveridade(media);

          return (
            <Polyline
              key={id}
              positions={rota}
              pathOptions={{ color: cor, weight: 6, opacity: 0.75 }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <strong>Linha {id}</strong><br/>
                  Índice médio: {media.toFixed(2)}
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Pontos críticos (vindos da API) */}
        {pontosCriticos.map((p, idx) => {
          const cor = corSeveridade(p.indice);
          const raio = 8 + (p.relatos / 60); // Tamanho proporcional

          return (
            <CircleMarker
              key={idx}
              center={[p.lat, p.lng]}
              radius={raio}
              pathOptions={{
                color: '#ffffff', weight: 2, fillColor: cor, fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-800">Linha {p.linha}</div>
                  <div>Índice: <b style={{ color: cor }}>{p.indice.toFixed(1)}</b></div>
                  <div>Relatos: <b>{p.relatos}</b></div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legenda */}
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
      </div>
    </div>
  );
}
