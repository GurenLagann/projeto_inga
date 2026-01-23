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
