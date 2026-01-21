# Prompt para Criação de Site de Grupo de Capoeira

## Visão Geral
Criar um site completo e moderno para um grupo de capoeira com área pública e área exclusiva para membros, utilizando Next.js 15, TypeScript, Tailwind CSS e PostgreSQL.

## Stack Tecnológica

### Frontend
- **Framework**: Next.js 15.5.4 com App Router
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS 4.1.14
- **Componentes UI**: Radix UI (shadcn/ui pattern)
- **Ícones**: Lucide React
- **Build**: Turbopack

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Banco de Dados**: PostgreSQL (porta 5555)
- **ORM/Query**: pg (PostgreSQL client)
- **Autenticação**: bcryptjs para hash de senhas
- **Migrations**: Scripts SQL com TypeScript

## Estrutura do Projeto

### Páginas Públicas
1. **Homepage** (`/`)
   - Hero section com imagem de fundo e call-to-action
   - Seção "Sobre o Grupo" com estatísticas (anos de tradição, membros, cidades)
   - Seção de Eventos com cards informativos
   - Navegação suave entre seções

2. **Nossa História** (`/` com scroll para seção ou página separada)
   - Página dedicada com conteúdo histórico do grupo
   - Design responsivo e moderno

3. **Eventos** (`/` com scroll para seção)
   - Grid de cards de eventos
   - Informações: data, horário, localização, tipo, status
   - Badges coloridos para status (Confirmado, Vagas Limitadas, etc.)

### Área de Membros (Protegida)
4. **Login** (`/members`)
   - Formulário de login com email e senha
   - Validação de credenciais via API
   - Link para cadastro

5. **Cadastro** (`/register`)
   - Formulário completo com campos:
     - Nome completo (obrigatório)
     - Email (obrigatório, único)
     - Senha e confirmação (obrigatório, mínimo 6 caracteres)
     - Corda/Faixa atual
     - Cor da corda (color picker)
     - Grupo
     - Academia
     - Instrutor
     - Data de entrada
     - Data de batizado
     - Próxima graduação
   - Validação de senhas coincidentes
   - Feedback visual de sucesso/erro

6. **Área dos Membros** (`/members` após login)
   - Sistema de tabs com 3 abas:
     - **Meu Perfil**: Informações do aluno logado
       - Card destacado com corda atual (círculo colorido visual)
       - Nome da corda e próxima graduação
       - Grid com informações: email, grupo, academia, instrutor, datas
     - **Vídeos de Cursos**: Grid de cards com cursos
       - Thumbnail de imagem
       - Título, instrutor, duração, nível
       - Botão "Assistir"
     - **Localização das Academias**: Cards com informações das academias
       - Nome, endereço, telefone, horários
       - Botão "Ver no Mapa"
   - Botão de logout funcional

## Componentes UI Necessários

### Componentes Base (shadcn/ui pattern)
- `Button` - com variantes (default, outline, ghost)
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Input` - campos de formulário
- `Label` - labels para formulários
- `Badge` - badges com variantes
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

### Componentes de Layout
- `Header` - Navegação principal com menu responsivo
  - Logo/nome do grupo
  - Menu desktop e mobile
  - Destaque visual da seção ativa
- `Footer` - Rodapé com informações de contato
  - Redes sociais (Instagram, Facebook, YouTube)
  - Informações de contato (telefone, email, endereço)
  - Links rápidos
- `AppShell` - Container principal que gerencia navegação e páginas

### Componentes de Conteúdo
- `Hero` - Seção hero com imagem de fundo
- `About` - Seção sobre o grupo
- `Events` - Seção de eventos
- `HistoryPage` - Página de história completa
- `MembersArea` - Área completa de membros
- `RegisterForm` - Formulário de cadastro

## Banco de Dados

### Tabela: `users`
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255 NOT NULL)
- email (VARCHAR 255 UNIQUE NOT NULL)
- password_hash (VARCHAR 255 NOT NULL)
- corda (VARCHAR 100)
- corda_color (VARCHAR 7) -- código hex
- group_name (VARCHAR 255)
- academy (VARCHAR 255)
- instructor (VARCHAR 255)
- joined_date (DATE)
- baptized_date (DATE)
- next_graduation (VARCHAR 100)
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
```

### Funcionalidades do Banco
- Índice único em email para busca rápida
- Trigger automático para atualizar `updated_at`
- Função para atualização automática de timestamps

## API Routes (Next.js App Router)

### POST `/api/register`
- Validação de campos obrigatórios
- Verificação de email duplicado
- Hash de senha com bcrypt (10 rounds)
- Inserção no banco de dados
- Retorno de dados do usuário (sem senha)

### POST `/api/login`
- Validação de email e senha
- Busca de usuário no banco
- Verificação de senha com bcrypt
- Retorno de dados do usuário (sem senha)

### GET `/api/student?id={userId}`
- Busca informações do aluno por ID
- Retorno formatado para o frontend

## Design e UX

### Paleta de Cores
- **Primária**: Azul (#2563eb / blue-600)
- **Secundária**: Laranja (#ea580c / orange-600)
- **Background**: Branco e cinza claro (gray-50)
- **Texto**: Cinza escuro (gray-900) e cinza médio (gray-600)

### Características de Design
- Design moderno e limpo
- Totalmente responsivo (mobile-first)
- Animações suaves de transição
- Cards com hover effects (shadow-lg)
- Gradientes sutis para destaques
- Ícones do Lucide React para elementos visuais
- Imagens otimizadas com Next.js Image component

### Responsividade
- Breakpoints: mobile, tablet (md), desktop (lg)
- Menu hambúrguer para mobile
- Grids adaptativos (1 col mobile, 2-3 cols desktop)
- Textos e espaçamentos responsivos

## Funcionalidades Especiais

### Navegação
- Scroll suave entre seções na página principal
- Navegação por rotas para páginas separadas (members, history)
- Destaque visual da seção ativa no header
- Botão "Voltar ao topo" implícito via scroll

### Autenticação
- Login com validação de credenciais
- Armazenamento de userId no localStorage após login
- Logout que limpa dados e localStorage
- Proteção de rotas (conceitual - pode ser expandido)

### Área de Membros
- Carregamento assíncrono de dados após login
- Estados de loading durante requisições
- Fallback para dados mock se API falhar
- Exibição visual da corda com cor personalizada
- Tabs para organização de conteúdo

## Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── student/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── members/page.tsx
│   └── register/page.tsx
├── components/
│   ├── ui/ (componentes base)
│   ├── About.tsx
│   ├── AppShell.tsx
│   ├── Events.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── HistoryPage.tsx
│   ├── MembersArea.tsx
│   └── RegisterForm.tsx
├── lib/
│   ├── db.ts (conexão PostgreSQL)
│   ├── members-data.ts (dados mock)
│   ├── migrations.ts
│   └── migrations/
│       └── create-users-table.sql
├── types/
│   └── members.ts (interfaces TypeScript)
└── styles/
    └── globals.css
```

## Scripts NPM

- `npm run dev` - Desenvolvimento com Turbopack
- `npm run build` - Build de produção
- `npm start` - Servidor de produção
- `npm run migrate` - Executar migrations do banco
- `npm run lint` - Linter

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5555/nome_do_banco
```

## Requisitos de Implementação

1. **Setup Inicial**
   - Criar projeto Next.js 15 com TypeScript
   - Configurar Tailwind CSS 4
   - Instalar dependências (pg, bcryptjs, lucide-react, radix-ui)
   - Configurar conexão PostgreSQL

2. **Banco de Dados**
   - Criar script de migration SQL
   - Implementar função de execução de migrations
   - Configurar pool de conexões PostgreSQL

3. **Componentes UI**
   - Criar componentes base seguindo padrão shadcn/ui
   - Implementar variantes e estados
   - Garantir acessibilidade

4. **Páginas Públicas**
   - Implementar Hero com imagem de fundo
   - Criar seção About com estatísticas
   - Desenvolver seção Events com cards
   - Implementar página History completa
   - Criar Header e Footer responsivos

5. **Sistema de Autenticação**
   - Implementar API de registro
   - Implementar API de login
   - Criar formulário de cadastro completo
   - Criar formulário de login
   - Implementar validações e feedback

6. **Área de Membros**
   - Criar sistema de tabs
   - Implementar exibição de perfil do aluno
   - Criar visualização de cursos
   - Criar visualização de academias
   - Implementar API para buscar dados do aluno

7. **Navegação e UX**
   - Implementar scroll suave
   - Criar sistema de navegação entre páginas
   - Adicionar estados de loading
   - Implementar feedback visual de ações

8. **Otimizações**
   - Usar Next.js Image para otimização
   - Implementar lazy loading onde apropriado
   - Otimizar queries do banco de dados
   - Garantir performance em mobile

## Observações Importantes

- Todas as senhas devem ser hasheadas com bcrypt antes de salvar
- Nunca retornar password_hash nas respostas da API
- Validar todos os inputs do lado do servidor
- Usar TypeScript strict mode
- Implementar tratamento de erros adequado
- Garantir responsividade em todos os componentes
- Usar cores e estilos consistentes em todo o site
- Manter código limpo e bem documentado

## Resultado Esperado

Um site completo, moderno e funcional para um grupo de capoeira com:
- Páginas públicas atraentes e informativas
- Sistema de cadastro e login funcional
- Área exclusiva para membros com informações personalizadas
- Design responsivo e profissional
- Integração completa com PostgreSQL
- Código TypeScript type-safe e bem estruturado

