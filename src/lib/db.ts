import { config } from 'dotenv';
import { Pool } from 'pg';

// Carregar variáveis de ambiente (para scripts que rodam fora do Next.js)
config({ path: '.env.local' });
config({ path: '.env' });

// Validar se DATABASE_URL está configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ Erro: DATABASE_URL não está configurada!');
  console.error('Por favor, crie um arquivo .env.local com:');
  console.error('DATABASE_URL=postgresql://usuario:senha@localhost:5555/nome_do_banco');
  throw new Error('DATABASE_URL não configurada');
}

// Configuração da conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configurações adicionais para melhor estabilidade
  max: 20, // máximo de clientes no pool
  idleTimeoutMillis: 30000, // fecha clientes inativos após 30s
  connectionTimeoutMillis: 5000, // timeout de conexão de 5s
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no cliente PostgreSQL:', err);
  console.error('Verifique se o banco de dados está rodando e se a DATABASE_URL está correta');
});

// Função para testar a conexão
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Teste de conexão bem-sucedido:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
    }
    return false;
  }
}

export { pool };

