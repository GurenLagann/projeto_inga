# Changelog - Projeto Inga Capoeira

## Histórico de Alterações

### [80039c5] feat: Atualiza seção Quem Somos com informações reais do Ingá
**Data:** Janeiro 2026

- Título alterado de "Sobre o Grupo" para "Quem Somos"
- Descrição completa: fundação 22/01/1999, Mestre Perna
- Inclui conselho administrativo: C.Mestre Batata e C.Mestre Vavá
- Seção "Nossa Filosofia": amizade através da capoeira, evolução técnica
- Estatísticas atualizadas: 25+ anos, 5 países, 2 CDs

**Arquivo modificado:** `src/components/About.tsx`

---

### [6b06589] feat: Atualiza página Nossa História com conteúdo real do Ingá
**Data:** Janeiro 2026

#### Conteúdo Adicionado
- **Fundação:** 22 de janeiro de 1999, sob direção do Mestre Perna
- **Liderança:** Mestre Perna, C.Mestre Batata e C.Mestre Vavá
- **Timeline:** 8 marcos históricos de 1997 a 2024
- **Produções musicais:** CD Vol. I (2001) e Vol. II (2005)
- **Presença internacional:** Israel, EUA, Espanha, Argentina
- **Presença nacional:** SP, RJ, GO, MG, CE
- **Filosofia:** Amizade, Evolução Técnica, Respeito às Raízes

#### Seções da Página
- Header com título e descrição
- As Origens do Ingá (texto introdutório)
- Nossa Liderança (cards dos mestres)
- Linha do Tempo (8 marcos)
- Produções Musicais (2 CDs)
- Nossa Filosofia (3 pilares)
- Nossas Conquistas (estatísticas)
- Chamada para ação

**Arquivo modificado:** `src/components/HistoryPage.tsx`

---

### [57248cb] feat: Sistema completo de eventos com inscrições
**Data:** Janeiro 2026

#### Novas Funcionalidades
- **Sistema de Eventos Completo**
  - Tabelas `eventos` e `inscricoes_eventos` no banco de dados
  - CRUD completo de eventos pelo painel admin
  - Listagem pública de eventos futuros
  - Sistema de inscrições (membros logados e visitantes)

- **APIs Criadas**
  - `GET /api/eventos` - Lista eventos públicos (futuros)
  - `GET/POST/DELETE /api/eventos/inscricao` - Gerenciar inscrições
  - `GET /api/admin/stats` - Estatísticas do dashboard
  - `GET/POST/PUT/DELETE /api/admin/eventos` - CRUD de eventos
  - `GET/PUT/DELETE /api/admin/eventos/inscricoes` - Gerenciar inscrições (admin)

- **Dashboard Admin**
  - Novas estatísticas: Total de Alunos, Mestres, Instrutores
  - Nova aba "Eventos" com gestão completa
  - Modal para criar/editar eventos
  - Modal para visualizar e gerenciar inscrições
  - Botão de edição de membros na tabela de usuários

- **Componente Events.tsx (Home)**
  - Agora busca eventos dinamicamente da API
  - Modal de inscrição para visitantes (nome, email, telefone)
  - Modal de inscrição para usuários logados

- **Área de Membros**
  - Nova aba "Eventos" com próximos eventos
  - Inscrição/cancelamento com um clique
  - Indicador visual de "Inscrito"

#### Arquivos Modificados/Criados
- `src/lib/migrations/create-users-table.sql` - Novas tabelas
- `src/types/members.ts` - Tipos Evento, InscricaoEvento, DashboardStats
- `src/app/api/admin/eventos/route.ts` - CRUD eventos
- `src/app/api/admin/eventos/inscricoes/route.ts` - Gerenciar inscrições
- `src/app/api/admin/stats/route.ts` - Estatísticas
- `src/app/api/eventos/route.ts` - Listagem pública
- `src/app/api/eventos/inscricao/route.ts` - Inscrições públicas
- `src/app/api/admin/membros/route.ts` - Adicionado PUT para edição
- `src/components/AdminDashboard.tsx` - Aba eventos e estatísticas
- `src/components/Events.tsx` - Dinâmico com API
- `src/components/MembersArea.tsx` - Aba eventos

---

### [6502352] feat: Implementação de animações GSAP no site
**Data:** Janeiro 2026

- Integração da biblioteca GSAP para animações
- Animações de entrada em elementos da página
- Transições suaves entre seções

---

### [5903ea3] feat: Atualização formulários e modal moderno de horários
**Data:** Janeiro 2026

- Redesign do modal de horários de aulas
- Seleção visual de dias da semana
- Chips para tipos de aula
- Select para instrutores
- Formulário mais intuitivo

---

### [eee8e3c] refactor: Reestruturação do banco - separação usuarios/membros/graduacoes
**Data:** Janeiro 2026

- Separação de tabelas: `usuarios`, `membros`, `graduacoes`
- Tabela `academias` para locais de treino
- Tabela `horarios_aulas` para grade horária
- Tabela `sessions` para gerenciamento de sessões
- Sistema de graduações do Grupo Inga (17 níveis)

---

### [32b8a0b] feat: Implementação completa do sistema de membros e admin
**Data:** Janeiro 2026

- Painel administrativo completo
- CRUD de academias e horários
- Gestão de usuários (admin/comum)
- Perfil do aluno com dados de graduação
- Sistema de autenticação com sessões

---

### [06633c2] Add docs folder to .gitignore
- Ignorar pasta docs no versionamento

---

### [6f72a5b] Add CLAUDE.md with project guidance for Claude Code
- Documentação para assistente de código
- Estrutura do projeto e comandos

---

### [371cf15] [Refacto] Alteração das cores laranjas das páginas
- Ajuste de paleta de cores
- Padronização visual

---

### [8bc6f3a] First Commit
- Estrutura inicial do projeto Next.js
- Componentes base da landing page
- Configuração do Tailwind CSS

---

### [5394429] Initial commit from Create Next App
- Setup inicial do Next.js 15

---

## Estrutura Atual do Banco de Dados

```
usuarios          - Cadastro de login (email, senha, admin)
membros           - Dados do aluno (apelido, graduação, academia)
graduacoes        - 17 graduações do Grupo Inga
academias         - Locais de treino
horarios_aulas    - Grade de horários por academia
sessions          - Sessões de autenticação
eventos           - Eventos do grupo (rodas, batizados, workshops)
inscricoes_eventos - Inscrições em eventos
```

---

## Próximos Passos Sugeridos

### Alta Prioridade

1. **Sistema de Pagamentos**
   - Integração com gateway (Stripe, PagSeguro, Mercado Pago)
   - Pagamento de inscrições em eventos
   - Mensalidades de alunos

2. **Notificações**
   - Email de confirmação de inscrição
   - Lembrete de eventos próximos
   - Notificação de novas graduações

3. **Upload de Imagens**
   - Foto de perfil do membro
   - Imagens para eventos
   - Galeria de fotos do grupo

### Média Prioridade

4. **Relatórios Admin**
   - Exportar lista de inscritos (PDF/Excel)
   - Relatório de frequência
   - Estatísticas de crescimento

5. **Calendário Integrado**
   - Visualização mensal de eventos
   - Integração com Google Calendar
   - iCal export

6. **Sistema de Presença**
   - Check-in em aulas
   - QR Code para presença
   - Histórico de frequência do aluno

7. **Área do Mestre/Instrutor**
   - Painel específico para instrutores
   - Lançar presença dos alunos
   - Ver alunos da sua academia

### Baixa Prioridade

8. **PWA (Progressive Web App)**
   - Instalação no celular
   - Notificações push
   - Funcionamento offline básico

9. **Multi-idioma**
   - Suporte a inglês
   - Suporte a espanhol

10. **Sistema de Conquistas**
    - Badges por participação
    - Histórico de eventos
    - Gamificação

11. **Fórum/Comunidade**
    - Discussões entre membros
    - Compartilhamento de vídeos
    - Dicas e tutoriais

12. **Integração com Redes Sociais**
    - Login com Google/Facebook
    - Compartilhar eventos
    - Feed de atividades

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run lint      # Verificar código

# Banco de Dados
npm run migrate   # Executar migrations

# Git
git status        # Ver alterações
git log --oneline # Histórico de commits
```

---

## Tecnologias Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4
- **Backend:** Next.js API Routes, PostgreSQL
- **UI:** Radix UI, Lucide Icons, GSAP
- **Auth:** Sessões customizadas com bcryptjs

---

*Última atualização: Janeiro 2026*
