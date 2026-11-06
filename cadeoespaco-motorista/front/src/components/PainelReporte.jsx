import { useState } from 'react';
import { NIVEIS_LOTACAO, INTERVALO_LEMBRETE_MIN } from '../data/mockData';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../hooks/useSound';
import StatusGPS from './StatusGPS';
import TimerReporte from './TimerReporte';
import BotaoLotacao from './BotaoLotacao';
import HistoricoRelatos from './HistoricoRelatos';
import { formatarHora } from '../utils/formatters';
import { api } from '../services/api';

export default function PainelReporte({ viagem, onRelato, onLembrete }) {
  const { posicao, status, erro } = useGeolocation(true);
  const { tocarSucesso } = useSound();

  const [nivelAtual, setNivelAtual] = useState(null);
  const [relatos, setRelatos] = useState([]);
  const [ultimoEnvio, setUltimoEnvio] = useState(null);
  const [enviando, setEnviando] = useState(false); // NOVO: estado de envio

  const { segundosDesdeUltimoReporte, restantes, alerta, reset } = useTimer(
    INTERVALO_LEMBRETE_MIN, true, onLembrete
  );

  const handleReportar = async (nivel) => {
    if (enviando) return; // Evita duplo clique
    setEnviando(true);

    const novoRelato = {
      nivel,
      lat: posicao?.lat ?? -3.75, // Fallback se o GPS falhar
      lng: posicao?.lng ?? -38.55,
      velocidade: posicao?.velocidade ?? 0,
      timestamp: Date.now(),
      linhaId: viagem.linha.id,
      veiculoId: viagem.veiculo.id,
      sentido: viagem.sentido,
    };

    try {
      // Envia para o back-end
      await api.enviarRelato(novoRelato);

      // Se deu certo, atualiza a UI local
      onRelato?.(novoRelato);
      setRelatos((prev) => [...prev, novoRelato]);
      setNivelAtual(nivel);
      setUltimoEnvio(novoRelato.timestamp);
      reset();
      tocarSucesso();
    } catch (err) {
      alert("Erro ao enviar relato. Verifique a conexão com o servidor.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-blue-700 font-semibold">{viagem.linha.codigo} · {viagem.linha.nome}</p>
            <p className="text-[11px] text-blue-600">Carro {viagem.veiculo.numero_carro} · {viagem.veiculo.placa}</p>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-full shrink-0">EM VIAGEM</span>
        </div>
      </div>

      <StatusGPS posicao={posicao} status={status} erro={erro} />

      <TimerReporte segundos={segundosDesdeUltimoReporte} restantes={restantes} alerta={alerta} intervaloMin={INTERVALO_LEMBRETE_MIN} />

      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 px-1">
          {enviando ? 'Enviando relato...' : 'Toque para reportar lotação'}
        </p>
        <div className="grid grid-cols-2 gap-3 opacity-100">
          {NIVEIS_LOTACAO.map((n) => (
            <div key={n.valor} className={enviando ? 'opacity-50 pointer-events-none' : ''}>
              <BotaoLotacao nivel={n} ativo={nivelAtual === n.valor} onClick={handleReportar} />
            </div>
          ))}
        </div>
        {ultimoEnvio && <p className="text-[11px] text-emerald-600 text-center mt-2 font-medium">✓ Último envio às {formatarHora(ultimoEnvio)}</p>}
      </div>

      <HistoricoRelatos relatos={relatos} />
    </div>
  );
}
