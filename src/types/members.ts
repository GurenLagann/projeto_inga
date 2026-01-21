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

export interface Student {
  id: number;
  name: string;
  email: string;
  corda: string; // Nome da corda/faixa
  cordaColor: string; // Cor da corda para exibição visual
  group: string;
  academy: string;
  joinedDate: string; // Data de entrada
  baptizedDate?: string; // Data de batizado (opcional)
  instructor: string;
  nextGraduation?: string; // Próxima graduação (opcional)
}

