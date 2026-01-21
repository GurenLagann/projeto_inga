-- Tabela de usuários/alunos
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  corda VARCHAR(100),
  corda_color VARCHAR(7),
  group_name VARCHAR(255),
  academy VARCHAR(255),
  instructor VARCHAR(255),
  joined_date DATE,
  baptized_date DATE,
  next_graduation VARCHAR(100),
  admin INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Tabela de sessões para autenticação segura
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para sessões
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de academias/locais
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

-- Adicionar colunas se não existirem (para bancos existentes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academias' AND column_name = 'address_number') THEN
    ALTER TABLE academias ADD COLUMN address_number VARCHAR(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academias' AND column_name = 'complement') THEN
    ALTER TABLE academias ADD COLUMN complement VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'academias' AND column_name = 'neighborhood') THEN
    ALTER TABLE academias ADD COLUMN neighborhood VARCHAR(100);
  END IF;
END $$;

-- Índice para busca por cidade
CREATE INDEX IF NOT EXISTS idx_academias_city ON academias(city);
CREATE INDEX IF NOT EXISTS idx_academias_active ON academias(active);

-- Trigger para atualizar updated_at em academias
DROP TRIGGER IF EXISTS update_academias_updated_at ON academias;
CREATE TRIGGER update_academias_updated_at
    BEFORE UPDATE ON academias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de horários de aulas
CREATE TABLE IF NOT EXISTS horarios_aulas (
  id SERIAL PRIMARY KEY,
  academia_id INTEGER NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  instructor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_type VARCHAR(100),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para horários
CREATE INDEX IF NOT EXISTS idx_horarios_academia ON horarios_aulas(academia_id);
CREATE INDEX IF NOT EXISTS idx_horarios_instructor ON horarios_aulas(instructor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_day ON horarios_aulas(day_of_week);
CREATE INDEX IF NOT EXISTS idx_horarios_active ON horarios_aulas(active);

-- Trigger para atualizar updated_at em horários
DROP TRIGGER IF EXISTS update_horarios_updated_at ON horarios_aulas;
CREATE TRIGGER update_horarios_updated_at
    BEFORE UPDATE ON horarios_aulas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
