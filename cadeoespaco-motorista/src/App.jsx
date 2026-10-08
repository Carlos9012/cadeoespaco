// Refere-se à Seção 3.10 do artigo — Prova de conceito com sinalização
// centralizada pelo responsável a bordo (motorista ou cobrador).
//
// Sem tela de login no front. O back-end estará preparado para JWT:
//   POST /api/auth/login  → token
//   GET  /api/auth/me     → substitui MOTORISTA_MOCK
// Quando implementado, basta trocar o mock pelo retorno de /api/auth/me
// e adicionar header Authorization nas chamadas de /api/relatos.

import { useState } from 'react'
import AppHeader from './components/AppHeader'
import Toast from './components/Toast'
import SelecaoViagem from './components/SelecaoViagem'
import PainelReporte from './components/PainelReporte'
import ResumoViagem from './components/ResumoViagem'
import { useSound } from './hooks/useSound'
import { useLocalStorage } from './hooks/useLocalStorage'

export default function App() {
  const [tela, setTela] = useState('selecao')
  const [viagem, setViagem] = useState(null)
  const [relatosViagem, setRelatosViagem] = useState([])
  const [toast, setToast] = useState(null)
  const { tocarLembrete } = useSound()
  const [, setHistoricoGlobal] = useLocalStorage('historico-viagens', [])

  const iniciarViagem = (dados) => {
    setViagem(dados)
    setRelatosViagem([])
    setTela('reporte')
    setToast({ mensagem: 'Viagem iniciada · GPS ativado', tipo: 'sucesso' })
  }

  const registrarRelato = (relato) => {
    setRelatosViagem((prev) => [...prev, relato])
    setToast({ mensagem: `Relato enviado · nível ${relato.nivel}`, tipo: 'sucesso' })
    // TODO (back): POST /api/relatos já ocorre no PainelReporte.
    setHistoricoGlobal((prev) => [...prev, relato])
  }

  const encerrarViagem = () => setTela('resumo')

  const novaViagem = () => {
    setViagem(null)
    setRelatosViagem([])
    setTela('selecao')
  }

  const dispararLembrete = () => {
    tocarLembrete()
    setToast({ mensagem: '⏰ Hora de atualizar a lotação', tipo: 'info' })
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader viagemAtiva={tela === 'reporte'} onEncerrar={encerrarViagem} />
      <main className="flex-1">
        {tela === 'selecao' && <SelecaoViagem onIniciar={iniciarViagem} />}
        {tela === 'reporte' && viagem && <PainelReporte viagem={viagem} onRelato={registrarRelato} onLembrete={dispararLembrete} />}
        {tela === 'resumo' && viagem && <ResumoViagem viagem={viagem} relatos={relatosViagem} onNovaViagem={novaViagem} />}
      </main>
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onFechar={() => setToast(null)} />}
    </div>
  )
}