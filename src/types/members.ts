export interface Course {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  thumbnail: string;
}

export interface Academy {
  id: number;
  name: string;
  address: string;
  phone: string;
  schedule: string;
}

// Usuário do sistema (login)
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  admin: number;
}

// Membro do Grupo Inga Capoeira (aluno)
export interface Membro {
  id: number;
  apelido: string | null;
  graduacaoId: number | null;
  graduacaoNome: string | null;
  graduacaoCorda: string | null;
  corPrimaria: string | null;
  corSecundaria: string | null;
  proximaGraduacaoId: number | null;
  proximaGraduacaoNome: string | null;
  mestreId: number | null;
  mestreNome: string | null;
  academiaId: number | null;
  academiaNome: string | null;
  dataEntrada: string | null;
  dataBatizado: string | null;
}

// Dados da sessão completa
export interface SessionData {
  user: User;
  membro: Membro | null;
}

// Tipo legado para compatibilidade (deprecated)
export interface Student {
  id: number;
  name: string;
  email: string;
  corda: string;
  cordaColor: string;
  group: string;
  academy: string;
  joinedDate: string;
  baptizedDate?: string;
  instructor: string;
  nextGraduation?: string;
}

// Evento do grupo
export interface Evento {
  id: number;
  titulo: string;
  descricao: string | null;
  dataInicio: string;
  dataFim: string | null;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  tipo: 'roda' | 'batizado' | 'workshop' | 'treino' | 'geral';
  status: 'confirmado' | 'vagas_limitadas' | 'inscricoes_abertas' | 'cancelado';
  maxParticipantes: number | null;
  permiteInscricaoPublica: boolean;
  valor: number | null;
  academiaId: number | null;
  academiaNome?: string | null;
  totalInscritos?: number;
  active?: boolean;
}

// Inscrição em evento
export interface InscricaoEvento {
  id: number;
  eventoId: number;
  membroId: number | null;
  usuarioId: number | null;
  nomeExterno: string | null;
  emailExterno: string | null;
  telefoneExterno: string | null;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'presente';
  dataInscricao: string;
  // Dados relacionados
  membroNome?: string | null;
  usuarioNome?: string | null;
}

// Estatísticas do dashboard admin
export interface DashboardStats {
  totalAlunos: number;
  totalMestres: number;
  totalInstrutores: number;
}
