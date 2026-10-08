// TODO (back): substituir por GET /api/auth/me após implementar JWT.
export const MOTORISTA_MOCK = {
  id: 'M001',
  nome: 'João Silva',
  matricula: '12345',
  empresa: 'Sinnob',
}

export const LINHAS = [
  { id: 'L1', codigo: '101', nome: 'Parangaba/Messejana', empresa: 'Sinnob' },
  { id: 'L2', codigo: '205', nome: 'Centro/Antônio Bezerra', empresa: 'São José' },
  { id: 'L3', codigo: '312', nome: 'Aldeota/Papicu', empresa: 'Vitória' },
  { id: 'L4', codigo: '401', nome: 'Messejana/Centro', empresa: 'Sinnob' },
  { id: 'L5', codigo: '502', nome: 'Conjunto Ceará/Centro', empresa: 'São José' },
]

export const VEICULOS = [
  { id: 'V001', placa: 'ABC-1A23', numeroCarro: '101-01', linhaId: 'L1' },
  { id: 'V002', placa: 'ABC-2B34', numeroCarro: '101-02', linhaId: 'L1' },
  { id: 'V003', placa: 'XYZ-3C45', numeroCarro: '205-01', linhaId: 'L2' },
  { id: 'V004', placa: 'XYZ-4D56', numeroCarro: '205-02', linhaId: 'L2' },
  { id: 'V005', placa: 'DEF-5E67', numeroCarro: '312-01', linhaId: 'L3' },
  { id: 'V006', placa: 'GHI-6F78', numeroCarro: '401-01', linhaId: 'L4' },
  { id: 'V007', placa: 'JKL-7G89', numeroCarro: '502-01', linhaId: 'L5' },
]

export const NIVEIS_LOTACAO = [
  { valor: 0, label: 'Vazio', descricao: 'Sem passageiros', cor: '#10b981',
    bgClass: 'bg-emerald-500 active:bg-emerald-600', ringClass: 'ring-emerald-300' },
  { valor: 1, label: 'Lugares', descricao: 'Lugares disponíveis', cor: '#fbbf24',
    bgClass: 'bg-amber-500 active:bg-amber-600', ringClass: 'ring-amber-300' },
  { valor: 2, label: 'Lotado', descricao: 'Sem lugares, mas passa', cor: '#f97316',
    bgClass: 'bg-orange-500 active:bg-orange-600', ringClass: 'ring-orange-300' },
  { valor: 3, label: 'Superlotado', descricao: 'Não aceita mais embarque', cor: '#ef4444',
    bgClass: 'bg-red-500 active:bg-red-600', ringClass: 'ring-red-300' },
]

export const INTERVALO_LEMBRETE_MIN = 10

export const SENTIDOS = [
  { id: 'ida', label: 'Ida (terminal → centro)' },
  { id: 'volta', label: 'Volta (centro → terminal)' },
]