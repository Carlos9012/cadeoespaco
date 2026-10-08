import { MOTORISTA_MOCK } from '../data/mockData'

export default function AppHeader({ viagemAtiva, onEncerrar }) {
  return (
    <header className="sticky top-0 z-20 bg-blue-600 text-white shadow-md">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-bold shrink-0">C</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">CadêOEspaço · Motorista</p>
            <p className="text-[11px] text-blue-100 truncate">{MOTORISTA_MOCK.nome} · Mat. {MOTORISTA_MOCK.matricula}</p>
          </div>
        </div>
        {viagemAtiva && (
          <button onClick={onEncerrar} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500 active:bg-red-600 shrink-0">
            Encerrar
          </button>
        )}
      </div>
    </header>
  )
}