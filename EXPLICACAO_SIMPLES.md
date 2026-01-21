# Explicação Simples da Estrutura do Código

## 🏠 Visão Geral: O que é este projeto?

Este é um **site para um grupo de capoeira** que tem duas partes principais:
1. **Parte pública** - Qualquer pessoa pode ver (homepage, eventos, história)
2. **Parte privada** - Só membros cadastrados podem acessar (área de membros)

---

## 📁 Estrutura de Pastas (Como uma Casa)

Pense no projeto como uma casa com diferentes cômodos:

```
/var/www/inga_project/
│
├── 📄 package.json          → Lista de "ferramentas" (bibliotecas) usadas
├── 📄 .env                  → Configurações secretas (senha do banco)
│
└── src/                     → Código fonte (o coração do projeto)
    │
    ├── app/                  → 🚪 PORTAS DA CASA (Páginas e Rotas)
    │   ├── page.tsx          → Porta principal (página inicial)
    │   ├── members/          → Porta da área de membros
    │   ├── register/         → Porta do cadastro
    │   └── api/              → 🛠️ SERVIÇOS (APIs - comunicação com banco)
    │       ├── login/        → Serviço de login
    │       ├── register/     → Serviço de cadastro
    │       └── student/      → Serviço de buscar dados do aluno
    │
    ├── components/           → 🧱 PEÇAS DE CONSTRUÇÃO (Componentes reutilizáveis)
    │   ├── ui/               → Peças básicas (botões, cards, inputs)
    │   ├── Header.tsx        → Cabeçalho do site
    │   ├── Footer.tsx        → Rodapé do site
    │   ├── Hero.tsx          → Seção principal da homepage
    │   ├── About.tsx          → Seção "Sobre nós"
    │   ├── Events.tsx        → Seção de eventos
    │   ├── MembersArea.tsx   → Área completa de membros
    │   └── RegisterForm.tsx → Formulário de cadastro
    │
    ├── lib/                  → 🧰 FERRAMENTAS (Códigos auxiliares)
    │   ├── db.ts             → Conexão com banco de dados
    │   ├── members-data.ts   → Dados de exemplo (mock)
    │   └── migrations.ts     → Script para criar tabelas no banco
    │
    └── types/                → 📋 REGRAS (Definições TypeScript)
        └── members.ts        → Define como são os dados (aluno, curso, etc)
```

---

## 🔄 Como Funciona o Fluxo?

### 1️⃣ **Usuário Acessa o Site** (Página Pública)

```
Usuário → / (homepage)
         ↓
    AppShell.tsx (gerencia tudo)
         ↓
    ┌─────────────────┐
    │  Header.tsx     │ ← Menu de navegação
    │  Hero.tsx        │ ← Seção principal
    │  About.tsx       │ ← Sobre o grupo
    │  Events.tsx      │ ← Eventos
    │  Footer.tsx      │ ← Rodapé
    └─────────────────┘
```

### 2️⃣ **Usuário Quer se Cadastrar**

```
Usuário → /register
         ↓
    RegisterForm.tsx
         ↓
    Preenche formulário
         ↓
    Envia para → /api/register
         ↓
    API salva no PostgreSQL
         ↓
    Retorna sucesso
         ↓
    Redireciona para /members
```

### 3️⃣ **Usuário Faz Login**

```
Usuário → /members
         ↓
    MembersArea.tsx (mostra formulário de login)
         ↓
    Usuário digita email e senha
         ↓
    Envia para → /api/login
         ↓
    API verifica no PostgreSQL
         ↓
    Se correto → mostra área de membros
    Se errado → mostra erro
```

### 4️⃣ **Usuário Logado Vê Suas Informações**

```
Usuário logado → /members
         ↓
    MembersArea.tsx carrega dados
         ↓
    Busca → /api/student?id=123
         ↓
    API busca no PostgreSQL
         ↓
    Retorna dados do aluno
         ↓
    Mostra em 3 abas:
    - Meu Perfil (corda, informações)
    - Vídeos de Cursos
    - Localização das Academias
```

---

## 🧩 Componentes Principais Explicados

### **AppShell.tsx** - O "Gerente"
- Controla qual página mostrar
- Gerencia navegação entre seções
- É como um "diretor de tráfego"

### **MembersArea.tsx** - A "Área VIP"
- Mostra tela de login se não estiver logado
- Mostra conteúdo exclusivo se estiver logado
- Tem 3 abas: Perfil, Cursos, Academias

### **RegisterForm.tsx** - O "Formulário de Cadastro"
- Coleta todas as informações do novo membro
- Valida se as senhas são iguais
- Envia para API salvar no banco

### **Header.tsx** - O "Menu"
- Sempre visível no topo
- Links para navegar pelo site
- Destaque da página atual

---

## 💾 Banco de Dados (PostgreSQL)

### Tabela: `users`
É como uma **planilha** com colunas:

| id | name | email | password_hash | corda | corda_color | ... |
|----|------|-------|---------------|-------|-------------|-----|
| 1  | João | joao@... | $2a$10$... | Verde | #22c55e | ... |

**Importante:**
- `password_hash` = senha criptografada (nunca salva a senha real!)
- Cada linha = um membro cadastrado

---

## 🔌 APIs (Como Funcionam)

### **POST /api/register**
```
Recebe: { name, email, password, ... }
Faz: 
  1. Verifica se email já existe
  2. Criptografa a senha
  3. Salva no banco
Retorna: { message: "Sucesso", user: {...} }
```

### **POST /api/login**
```
Recebe: { email, password }
Faz:
  1. Busca usuário no banco pelo email
  2. Compara senha criptografada
  3. Se correto, retorna dados do usuário
Retorna: { user: {...} } ou { error: "Email ou senha incorretos" }
```

### **GET /api/student?id=123**
```
Recebe: id do usuário
Faz:
  1. Busca no banco pelo id
  2. Retorna dados (sem a senha!)
Retorna: { id, name, email, corda, ... }
```

---

## 🎨 UI Components (Peças de Lego)

### Componentes Base (`ui/`)
São como **peças de Lego básicas** que você monta coisas maiores:

- `Button` → Botões (azul, outline, etc)
- `Card` → Caixas com borda
- `Input` → Campos de texto
- `Label` → Rótulos
- `Badge` → Etiquetas coloridas
- `Tabs` → Sistema de abas

### Como Usar:
```tsx
<Card>                    ← Caixa
  <CardHeader>            ← Cabeçalho da caixa
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>           ← Conteúdo da caixa
    <Button>Clique</Button>  ← Botão dentro
  </CardContent>
</Card>
```

---

## 🔐 Segurança

### Senhas
- ❌ **NUNCA** salva a senha real
- ✅ **SEMPRE** criptografa com bcrypt antes de salvar
- ✅ **SEMPRE** compara a versão criptografada no login

### Dados Sensíveis
- Senhas ficam no `.env` (não vai pro GitHub!)
- `password_hash` nunca é retornado nas APIs

---

## 📱 Responsividade

O site funciona em:
- 📱 **Mobile** (celular) - 1 coluna, menu hambúrguer
- 📱 **Tablet** - 2 colunas
- 💻 **Desktop** - 3 colunas, menu completo

**Como funciona:**
```css
grid md:grid-cols-2 lg:grid-cols-3
```
- Mobile: 1 coluna
- Tablet (md): 2 colunas  
- Desktop (lg): 3 colunas

---

## 🚀 Como Rodar o Projeto

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco
Criar arquivo `.env`:
```
DATABASE_URL=postgresql://usuario:senha@localhost:5555/inga_capoeira
```

### 3. Criar tabelas
```bash
npm run migrate
```

### 4. Rodar projeto
```bash
npm run dev
```

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────┐
│         USUÁRIO (Navegador)          │
└──────────────┬───────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      FRONTEND (Next.js/React)       │
│  ┌───────────────────────────────┐  │
│  │  Páginas (app/)               │  │
│  │  - Homepage                    │  │
│  │  - /members (login)            │  │
│  │  - /register (cadastro)       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Componentes (components/)   │  │
│  │  - Header, Footer, Hero, etc  │  │
│  └───────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ↓ (requisições HTTP)
┌─────────────────────────────────────┐
│      BACKEND (API Routes)            │
│  ┌───────────────────────────────┐  │
│  │  /api/login                    │  │
│  │  /api/register                 │  │
│  │  /api/student                  │  │
│  └───────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ↓ (SQL queries)
┌─────────────────────────────────────┐
│      BANCO DE DADOS (PostgreSQL)     │
│  ┌───────────────────────────────┐  │
│  │  Tabela: users                 │  │
│  │  - Dados dos membros           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🎯 Conceitos Importantes

### **State (Estado)**
É como a "memória" do componente. Exemplo:
```tsx
const [isLoggedIn, setIsLoggedIn] = useState(false);
// isLoggedIn = variável que guarda se está logado
// setIsLoggedIn = função para mudar o valor
```

### **useEffect**
É como um "alerta" que executa quando algo muda:
```tsx
useEffect(() => {
  if (isLoggedIn) {
    loadMembersData(); // Carrega dados quando faz login
  }
}, [isLoggedIn]); // Observa mudanças em isLoggedIn
```

### **Async/Await**
É como "esperar" uma tarefa terminar:
```tsx
const response = await fetch('/api/login');
// Espera a resposta da API antes de continuar
```

---

## ❓ Perguntas Frequentes

**Q: Onde fica o código que mostra a página inicial?**
R: `src/app/page.tsx` → chama `AppShell.tsx` → que mostra `Hero.tsx`, `About.tsx`, etc.

**Q: Como o login funciona?**
R: `MembersArea.tsx` envia email/senha → `/api/login` verifica no banco → retorna dados do usuário → salva ID no localStorage → mostra área de membros.

**Q: Onde os dados são salvos?**
R: No PostgreSQL. A tabela `users` guarda todos os membros cadastrados.

**Q: Como adicionar uma nova página?**
R: Criar arquivo em `src/app/nova-pagina/page.tsx` e adicionar link no `Header.tsx`.

**Q: Como mudar as cores?**
R: Editar classes Tailwind nos componentes (ex: `bg-blue-600` → `bg-red-600`).

---

## 🎓 Analogia Final

Pense no projeto como um **restaurante**:

- **app/** = Cardápio (o que o cliente vê)
- **components/** = Receitas (como fazer cada prato)
- **lib/** = Utensílios de cozinha (ferramentas)
- **api/** = Cozinha (onde a mágica acontece)
- **PostgreSQL** = Estoque (onde guarda os ingredientes/dados)

O cliente pede algo → o garçom (API) vai na cozinha → pega do estoque (banco) → prepara (processa) → entrega (retorna).

---

Espero que isso tenha ajudado! 🚀

