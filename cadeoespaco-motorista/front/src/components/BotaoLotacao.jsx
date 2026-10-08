export default function BotaoLotacao({ nivel, ativo, onClick }) {
  return (
    <button onClick={() => onClick(nivel.valor)}
      className={`relative w-full aspect-square rounded-2xl text-white font-bold shadow-md ${nivel.bgClass} ${ativo ? `ring-4 ${nivel.ringClass} scale-[0.97]` : ''} transition-transform active:scale-[0.95] flex flex-col items-center justify-center gap-1 px-2`}>
      <span className="text-2xl sm:text-3xl font-black">{nivel.valor}</span>
      <span className="text-sm font-semibold leading-tight text-center">{nivel.label}</span>
      <span className="text-[10px] opacity-90 leading-tight text-center px-1">{nivel.descricao}</span>
      {ativo && (
        <span className="absolute -top-1.5 -right-1.5 bg-white text-slate-800 text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">✓</span>
      )}
    </button>
  )
}