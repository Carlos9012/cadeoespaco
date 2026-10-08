import { useState } from 'react'
import { NIVEIS_LOTACAO, INTERVALO_LEMBRETE_MIN } from '../data/mockData'
import { useGeolocation } from '../hooks/useGeolocation'
import { useTimer } from '../hooks/useTimer'
import { useSound } from '../hooks/useSound'
import StatusGPS from './StatusGPS'
import TimerReporte from './TimerReporte'
import BotaoLotacao from './BotaoLotacao'
import HistoricoRelatos from './HistoricoRelatos'
import { formatarHora } from '../utils/formatters'

export default function PainelReporte({ viagem, onRelato, onLembrete }) {
  const { posicao, status, erro } = useGeolocation(true)
  const { tocarSucesso } = useSound()
  const [nivelAtual, setNivelAtual] = useState(null)
  const [relatos, setRelatos] = useState([])
  const [ultimoEnvio, setUltimoEnvio] = useState(null)
  const { segundosDesdeUltimoReporte, restantes, alerta, reset } = useTimer(INTERVALO_LEMBRETE_MIN, true, onLembrete)

  const handleReportar = (nivel) => {
    const relato = {
      id: `R${Date.now()}`,
      nivel,
      lat: posicao?.lat ?? null,
      lng: posicao?.lng ?? null,
      velocidade: posicao?.velocidade ?? 0,
      timestamp: Date.now(),
      linhaId: viagem.linha.id,
      veiculoId: viagem.veiculo.id,
      sentido: viagem.sentido,
      origem: 'motorista',
    }
    // TODO (back): POST /api/relatos
    onRelato?.(relato)
    setRelatos((prev) => [...prev, relato])
    setNivelAtual(nivel)
    setUltimoEnvio(relato.timestamp)
    reset()
    tocarSucesso()
  }

  return (
    <div className="p-4 space-y-3">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-blue-700 font-semibold">{viagem.linha.codigo} · {viagem.linha.nome}</p>
            <p className="text-[11px] text-blue-600">Carro {viagem.veiculo.numeroCarro} · {viagem.veiculo.placa} · {viagem.sentido === 'ida' ? 'Ida' : 'Volta'}</p>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-full shrink-0">EM VIAGEM</span>
        </div>
      </div>

      <StatusGPS posicao={posicao} status={status} erro={erro} />

      <TimerReporte segundos={segundosDesdeUltimoReporte} restantes={restantes} alerta={alerta} intervaloMin={INTERVALO_LEMBRETE_MIN} />

      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 px-1">Toque para reportar lotação</p>
        <div className="grid grid-cols-2 gap-3">
          {NIVEIS_LOTACAO.map((n) => (
            <BotaoLotacao key={n.valor} nivel={n} ativo={nivelAtual === n.valor} onClick={handleReportar} />
          ))}
        </div>
        {ultimoEnvio && <p className="text-[11px] text-slate-400 text-center mt-2">Último envio às {formatarHora(ultimoEnvio)}</p>}
      </div>

      <HistoricoRelatos relatos={relatos} />
    </div>
  )
}