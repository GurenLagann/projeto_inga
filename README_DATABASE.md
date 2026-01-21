# Configuração do Banco de Dados PostgreSQL

## Pré-requisitos

1. Docker instalado
2. PostgreSQL rodando em Docker

## Configuração

### 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com a seguinte configuração:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5555/nome_do_banco
```

Exemplo completo:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5555/inga_capoeira
```

### 2. Criar o banco de dados

Se o banco ainda não existe, crie-o no PostgreSQL:

```sql
CREATE DATABASE inga_capoeira;
```

### 3. Executar as migrations

Execute o script de migration para criar a tabela de usuários:

```bash
npm run migrate
```

Ou execute diretamente com tsx:

```bash
npx tsx src/lib/migrations.ts
```

### 4. Verificar se a tabela foi criada

Conecte-se ao PostgreSQL e verifique:

```sql
\dt
SELECT * FROM users;
```

## Estrutura da Tabela

A tabela `users` contém os seguintes campos:

- `id` - ID único do usuário (SERIAL PRIMARY KEY)
- `name` - Nome completo (VARCHAR 255)
- `email` - Email único (VARCHAR 255 UNIQUE)
- `password_hash` - Hash da senha (VARCHAR 255)
- `corda` - Corda/Faixa atual (VARCHAR 100)
- `corda_color` - Cor da corda em hex (VARCHAR 7)
- `group_name` - Nome do grupo (VARCHAR 255)
- `academy` - Academia (VARCHAR 255)
- `instructor` - Instrutor (VARCHAR 255)
- `joined_date` - Data de entrada (DATE)
- `baptized_date` - Data de batizado (DATE)
- `next_graduation` - Próxima graduação (VARCHAR 100)
- `created_at` - Data de criação (TIMESTAMP)
- `updated_at` - Data de atualização (TIMESTAMP)

## Rotas da API

### POST /api/register
Cadastra um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "corda": "Corda Verde",
  "cordaColor": "#22c55e",
  "groupName": "Grupo Inga Capoeira",
  "academy": "Academia Central",
  "instructor": "Mestre João",
  "joinedDate": "2023-03-15",
  "baptizedDate": "2023-06-20",
  "nextGraduation": "Corda Verde-Amarela"
}
```

### POST /api/login
Faz login de um usuário.

**Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

### GET /api/student?id={userId}
Busca informações de um aluno específico.

## Páginas

- `/register` - Formulário de cadastro de novo membro
- `/members` - Área dos membros (requer login)

