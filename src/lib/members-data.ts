import { Course, Academy, Student } from '@/types/members';

// Dados mock - em produção, estas funções serão substituídas por chamadas API
const mockCourses: Course[] = [
  {
    id: 1,
    title: "Fundamentos da Capoeira",
    instructor: "Mestre Vava",
    duration: "45 min",
    level: "Iniciante",
    thumbnail: "https://images.unsplash.com/photo-1583166614297-a97b68d5cead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBvZWlyYSUyMG1hcnRpYWwlMjBhcnRzJTIwYnJhemlsfGVufDF8fHx8MTc1OTY4MzcxNHww&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 2,
    title: "Sequências de Ginga",
    instructor: "Professor Maria Santos",
    duration: "30 min",
    level: "Intermediário",
    thumbnail: "https://images.unsplash.com/photo-1738835935023-ebff4a85bc7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBvZWlyYSUyMGdyb3VwJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzU5NjgzNzE2fDA&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 3,
    title: "Instrumentos: Berimbau",
    instructor: "Mestre Vava",
    duration: "60 min",
    level: "Todos os níveis",
    thumbnail: "https://images.unsplash.com/photo-1759352441436-143e91f617ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJpbWJhdSUyMGNhcG9laXJhJTIwbXVzaWN8ZW58MXx8fHwxNzU5NjgzNzE5fDA&ixlib=rb-4.1.0&q=80&w=400"
  }
];

const mockAcademies: Academy[] = [
  {
    id: 1,
    name: "Academia Central",
    address: "Rua Augusta, 1234 - Centro, São Paulo",
    phone: "(11) 99999-1234",
    schedule: "Seg a Sex: 18h às 22h | Sáb: 9h às 12h"
  },
  {
    id: 2,
    name: "Academia Vila Madalena",
    address: "Rua Harmonia, 567 - Vila Madalena, São Paulo",
    phone: "(11) 99999-5678",
    schedule: "Seg a Sex: 19h às 21h | Dom: 10h às 12h"
  },
  {
    id: 3,
    name: "Academia Santos",
    address: "Av. Ana Costa, 890 - Santos, SP",
    phone: "(13) 99999-9012",
    schedule: "Ter e Qui: 20h às 22h | Sáb: 14h às 17h"
  }
];

/**
 * Busca todos os cursos disponíveis para membros
 * Em produção, substituir por: fetch('/api/courses')
 */
export async function getCourses(): Promise<Course[]> {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCourses;
}

/**
 * Busca todas as academias disponíveis
 * Em produção, substituir por: fetch('/api/academies')
 */
export async function getAcademies(): Promise<Academy[]> {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockAcademies;
}

/**
 * Busca informações do aluno logado
 * Em produção, substituir por: fetch('/api/student/me')
 */
export async function getStudentInfo(): Promise<Student> {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Dados mock do aluno - em produção viria da sessão/API
  return {
    id: 1,
    name: "Vava",
    email: "joao@example.com",
    corda: "Corda Verde",
    cordaColor: "#22c55e", // Verde em hex
    group: "Grupo Inga Capoeira",
    academy: "Academia Central",
    joinedDate: "15/03/2023",
    baptizedDate: "20/06/2023",
    instructor: "Mestre Vava",
    nextGraduation: "Corda Verde-Amarela"
  };
}

