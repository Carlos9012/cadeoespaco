import { useState } from 'react'
import { LINHAS, VEICULOS, SENTIDOS } from '../data/mockData'

export default function SelecaoViagem({ onIniciar }) {
  const [linhaId, setLinhaId] = useState('')
  const [veiculoId, setVeiculoId] = useState('')
  const [sentido, setSentido] = useState('ida')

  const veiculosDisponiveis = VEICULOS.filter((v) => v.linhaId === linhaId)
  const podeIniciar = linhaId && veiculoId

  const handleIniciar = () => {
    if (!podeIniciar) return
    const linha = LINHAS.find((l) => l.id === linhaId)
    const veiculo = VEICULOS.find((v) => v.id === veiculoId)
    onIniciar({ linha, veiculo, sentido })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Iniciar viagem</h2>
        <p className="text-xs text-slate-500 mb-5">Selecione os dados do veículo para começar o reporte</p>

        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Linha</span>
          <select value={linhaId} onChange={(e) => { setLinhaId(e.target.value); setVeiculoId('') }}
            className="mt-1.5 w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Escolha a linha</option>
            {LINHAS.map((l) => <option key={l.id} value={l.id}>{l.codigo} — {l.nome}</option>)}
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Veículo</span>
          <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} disabled={!linhaId}
            className="mt-1.5 w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400">
            <option value="">{linhaId ? 'Escolha o veículo' : 'Escolha a linha primeiro'}</option>
            {veiculosDisponiveis.map((v) => <option key={v.id} value={v.id}>{v.numeroCarro} · {v.placa}</option>)}
          </select>
        </label>

        <label className="block mb-6">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Sentido</span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {SENTIDOS.map((s) => (
              <button key={s.id} type="button" onClick={() => setSentido(s.id)}
                className={`px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${sentido === s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 active:bg-slate-50'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </label>

        <button onClick={handleIniciar} disabled={!podeIniciar}
          className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md active:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none transition-colors">
          Iniciar viagem
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Como funciona:</span> após iniciar, você reportará a lotação tocando em um dos 4 botões. O GPS é capturado automaticamente e um alerta é emitido a cada 10 minutos.
        </p>
      </div>
    </div>
  )
}