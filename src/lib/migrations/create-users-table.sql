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
  tipo VARCHAR(20) NOT NULL DEFAULT 'aluno',
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_graduacoes_ordem ON graduacoes(ordem);

-- Adiciona coluna tipo se não existir (para migrations incrementais)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'graduacoes' AND column_name = 'tipo') THEN
    ALTER TABLE graduacoes ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'aluno';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_graduacoes_tipo ON graduacoes(tipo);

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
-- Tipos: aluno, formado, mestre
-- =====================================================
INSERT INTO graduacoes (nome, corda, cor_primaria, cor_secundaria, ordem, tipo, descricao)
VALUES
  ('Aluno', 'Crua e Verde', '#EDEEE9', '#22C55E', 1, 'Adulto', 'Primeira Corda do Aluno'),
  ('Aluno', 'Crua e Amarela', '#EDEEE9', '#FFD700', 2, 'Adulto', 'Segunda Corda do Aluno'),
  ('Aluno', 'Crua e Azul', '#EDEEE9', '#1E90FF', 3, 'Adulto', 'Terceira Corda do Aluno'),
  ('Aluno', 'Verde', '#22C55E', NULL, 4, 'infantil', 'Corda verde infantil'),
  ('Amarela', 'Amarela', '#FFD700', NULL, 3, 'aluno', 'Corda amarela'),
  ('Amarela-Laranja', 'Amarela-Laranja', '#FFD700', '#FF8C00', 4, 'aluno', 'Transição amarela para laranja'),
  ('Laranja', 'Laranja', '#FF8C00', NULL, 5, 'aluno', 'Corda laranja'),
  ('Laranja-Azul', 'Laranja-Azul', '#FF8C00', '#1E90FF', 6, 'aluno', 'Transição laranja para azul'),
  ('Azul', 'Azul', '#1E90FF', NULL, 7, 'aluno', 'Corda azul'),
  ('Azul-Verde', 'Azul-Verde', '#1E90FF', '#22C55E', 8, 'aluno', 'Transição azul para verde'),
  ('Verde', 'Verde', '#22C55E', NULL, 9, 'aluno', 'Corda verde'),
  ('Verde-Roxa', 'Verde-Roxa', '#22C55E', '#8B5CF6', 10, 'aluno', 'Transição verde para roxa'),
  ('Roxa', 'Roxa', '#8B5CF6', NULL, 11, 'aluno', 'Corda roxa'),
  ('Roxa-Marrom', 'Roxa-Marrom', '#8B5CF6', '#8B4513', 12, 'aluno', 'Transição roxa para marrom'),
  ('Marrom', 'Marrom', '#8B4513', NULL, 13, 'aluno', 'Corda marrom'),
  ('Marrom-Vermelha', 'Marrom-Vermelha', '#8B4513', '#DC2626', 14, 'aluno', 'Transição marrom para vermelha'),
  ('Vermelha', 'Vermelha', '#DC2626', NULL, 15, 'formado', 'Corda vermelha - Formado'),
  ('Vermelha-Branca', 'Vermelha-Branca', '#DC2626', '#FFFFFF', 16, 'mestre', 'Contra-Mestre'),
  ('Branca', 'Branca', '#FFFFFF', NULL, 17, 'mestre', 'Mestre')
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABELA: EVENTOS
-- Eventos do grupo (rodas, batizados, workshops, etc)
-- =====================================================
CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  hora_inicio TIME,
  hora_fim TIME,
  local VARCHAR(500),
  tipo VARCHAR(50) DEFAULT 'geral',
  status VARCHAR(30) DEFAULT 'confirmado',
  max_participantes INTEGER,
  permite_inscricao_publica BOOLEAN DEFAULT false,
  valor DECIMAL(10,2),
  academia_id INTEGER REFERENCES academias(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_active ON eventos(active);
CREATE INDEX IF NOT EXISTS idx_eventos_academia ON eventos(academia_id);

DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
CREATE TRIGGER update_eventos_updated_at
    BEFORE UPDATE ON eventos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: INSCRICOES_EVENTOS
-- Inscrições em eventos (membros ou externos)
-- =====================================================
CREATE TABLE IF NOT EXISTS inscricoes_eventos (
  id SERIAL PRIMARY KEY,
  evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  membro_id INTEGER REFERENCES membros(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nome_externo VARCHAR(255),
  email_externo VARCHAR(255),
  telefone_externo VARCHAR(30),
  status VARCHAR(30) DEFAULT 'confirmada',
  data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(evento_id, membro_id),
  UNIQUE(evento_id, email_externo)
);

CREATE INDEX IF NOT EXISTS idx_inscricoes_evento ON inscricoes_eventos(evento_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_membro ON inscricoes_eventos(membro_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_usuario ON inscricoes_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON inscricoes_eventos(status);

-- =====================================================
-- TABELA: PRESENCAS
-- Registro de presença nas aulas
-- =====================================================
CREATE TABLE IF NOT EXISTS presencas (
  id SERIAL PRIMARY KEY,
  horario_aula_id INTEGER NOT NULL REFERENCES horarios_aulas(id) ON DELETE CASCADE,
  membro_id INTEGER NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
  data_aula DATE NOT NULL,
  presente BOOLEAN DEFAULT true,
  hora_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metodo_checkin VARCHAR(20) DEFAULT 'manual',
  registrado_por INTEGER REFERENCES membros(id),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(horario_aula_id, membro_id, data_aula)
);

CREATE INDEX IF NOT EXISTS idx_presencas_horario ON presencas(horario_aula_id);
CREATE INDEX IF NOT EXISTS idx_presencas_membro ON presencas(membro_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas(data_aula);

-- =====================================================
-- TABELA: VIDEO_AULAS
-- Aulas em vídeo organizadas por categoria
-- =====================================================
CREATE TABLE IF NOT EXISTS video_aulas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('movimentacoes', 'musicalidade', 'historia')),
  url_video VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duracao VARCHAR(20),
  nivel VARCHAR(50),
  instrutor_nome VARCHAR(255),
  ordem INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_aulas_categoria ON video_aulas(categoria);
CREATE INDEX IF NOT EXISTS idx_video_aulas_active ON video_aulas(active);

DROP TRIGGER IF EXISTS update_video_aulas_updated_at ON video_aulas;
CREATE TRIGGER update_video_aulas_updated_at
    BEFORE UPDATE ON video_aulas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: INTERESSADOS
-- Pessoas interessadas em conhecer a capoeira
-- =====================================================
CREATE TABLE IF NOT EXISTS interessados (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(30),
  email VARCHAR(255),
  experiencia_capoeira BOOLEAN DEFAULT false,
  academia_interesse_id INTEGER REFERENCES academias(id),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'novo',
  contatado_em TIMESTAMP,
  contatado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interessados_status ON interessados(status);
CREATE INDEX IF NOT EXISTS idx_interessados_academia ON interessados(academia_interesse_id);
