-- =====================================================
-- ESTRUTURA DO BANCO DE DADOS - GRUPO INGA CAPOEIRA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABELA: USUARIOS
-- Cadastro para acesso à área de membros
-- Pode ser aluno, responsável por alunos, ou visitante
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  admin INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: GRADUACOES
-- Todas as graduações/cordas do Grupo Inga Capoeira
-- =====================================================
CREATE TABLE IF NOT EXISTS graduacoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  corda VARCHAR(100) NOT NULL,
  cor_primaria VARCHAR(7) NOT NULL,
  cor_secundaria VARCHAR(7),
  ordem INTEGER NOT NULL DEFAULT 0,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_graduacoes_ordem ON graduacoes(ordem);

-- =====================================================
-- TABELA: ACADEMIAS
-- Locais onde acontecem as aulas
-- =====================================================
CREATE TABLE IF NOT EXISTS academias (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  address_number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50),
  zip_code VARCHAR(20),
  phone VARCHAR(30),
  email VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academias_city ON academias(city);
CREATE INDEX IF NOT EXISTS idx_academias_active ON academias(active);

DROP TRIGGER IF EXISTS update_academias_updated_at ON academias;
CREATE TRIGGER update_academias_updated_at
    BEFORE UPDATE ON academias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: MEMBROS
-- Alunos do Grupo Inga Capoeira
-- Vinculado a um usuário para login
-- =====================================================
CREATE TABLE IF NOT EXISTS membros (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  apelido VARCHAR(100),
  graduacao_id INTEGER REFERENCES graduacoes(id) ON DELETE SET NULL,
  proxima_graduacao_id INTEGER REFERENCES graduacoes(id) ON DELETE SET NULL,
  mestre_id INTEGER REFERENCES membros(id) ON DELETE SET NULL,
  academia_id INTEGER REFERENCES academias(id) ON DELETE SET NULL,
  data_entrada DATE,
  data_batizado DATE,
  observacoes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membros_usuario ON membros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_membros_graduacao ON membros(graduacao_id);
CREATE INDEX IF NOT EXISTS idx_membros_academia ON membros(academia_id);
CREATE INDEX IF NOT EXISTS idx_membros_mestre ON membros(mestre_id);
CREATE INDEX IF NOT EXISTS idx_membros_active ON membros(active);

DROP TRIGGER IF EXISTS update_membros_updated_at ON membros;
CREATE TRIGGER update_membros_updated_at
    BEFORE UPDATE ON membros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: SESSOES
-- Gerenciamento de sessões de login
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- =====================================================
-- TABELA: HORARIOS_AULAS
-- Horários das aulas por academia
-- =====================================================
CREATE TABLE IF NOT EXISTS horarios_aulas (
  id SERIAL PRIMARY KEY,
  academia_id INTEGER NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  membro_instrutor_id INTEGER REFERENCES membros(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_type VARCHAR(100),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_horarios_academia ON horarios_aulas(academia_id);
CREATE INDEX IF NOT EXISTS idx_horarios_instrutor ON horarios_aulas(membro_instrutor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_day ON horarios_aulas(day_of_week);
CREATE INDEX IF NOT EXISTS idx_horarios_active ON horarios_aulas(active);

DROP TRIGGER IF EXISTS update_horarios_updated_at ON horarios_aulas;
CREATE TRIGGER update_horarios_updated_at
    BEFORE UPDATE ON horarios_aulas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: USUARIOS_MEMBROS (Relacionamento)
-- Um usuário pode ser responsável por vários membros
-- (ex: pai responsável por filhos alunos)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios_membros (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  membro_id INTEGER NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
  tipo_relacao VARCHAR(50) NOT NULL DEFAULT 'proprio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, membro_id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_membros_usuario ON usuarios_membros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_membros_membro ON usuarios_membros(membro_id);

-- =====================================================
-- INSERIR GRADUAÇÕES PADRÃO DO GRUPO INGA
-- =====================================================
INSERT INTO graduacoes (nome, corda, cor_primaria, cor_secundaria, ordem, descricao)
VALUES
  ('Iniciante', 'Crua', '#F5F5DC', NULL, 1, 'Aluno iniciante, sem batizado'),
  ('Batizado', 'Crua-Amarela', '#F5F5DC', '#FFD700', 2, 'Primeiro batizado'),
  ('Amarela', 'Amarela', '#FFD700', NULL, 3, 'Corda amarela'),
  ('Amarela-Laranja', 'Amarela-Laranja', '#FFD700', '#FF8C00', 4, 'Transição amarela para laranja'),
  ('Laranja', 'Laranja', '#FF8C00', NULL, 5, 'Corda laranja'),
  ('Laranja-Azul', 'Laranja-Azul', '#FF8C00', '#1E90FF', 6, 'Transição laranja para azul'),
  ('Azul', 'Azul', '#1E90FF', NULL, 7, 'Corda azul'),
  ('Azul-Verde', 'Azul-Verde', '#1E90FF', '#22C55E', 8, 'Transição azul para verde'),
  ('Verde', 'Verde', '#22C55E', NULL, 9, 'Corda verde'),
  ('Verde-Roxa', 'Verde-Roxa', '#22C55E', '#8B5CF6', 10, 'Transição verde para roxa'),
  ('Roxa', 'Roxa', '#8B5CF6', NULL, 11, 'Corda roxa'),
  ('Roxa-Marrom', 'Roxa-Marrom', '#8B5CF6', '#8B4513', 12, 'Transição roxa para marrom'),
  ('Marrom', 'Marrom', '#8B4513', NULL, 13, 'Corda marrom'),
  ('Marrom-Vermelha', 'Marrom-Vermelha', '#8B4513', '#DC2626', 14, 'Transição marrom para vermelha'),
  ('Vermelha', 'Vermelha', '#DC2626', NULL, 15, 'Corda vermelha - Formado'),
  ('Vermelha-Branca', 'Vermelha-Branca', '#DC2626', '#FFFFFF', 16, 'Contra-Mestre'),
  ('Branca', 'Branca', '#FFFFFF', NULL, 17, 'Mestre')
ON CONFLICT DO NOTHING;
