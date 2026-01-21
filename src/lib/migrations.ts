import { pool } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function runMigrations() {
  try {
    const sqlFile = readFileSync(
      join(process.cwd(), 'src/lib/migrations/create-users-table.sql'),
      'utf-8'
    );

    // Executa o SQL
    await pool.query(sqlFile);
    console.log('Migration executada com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migration:', error);
    throw error;
  }
}

// Executa migration se chamado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations concluídas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro nas migrations:', error);
      process.exit(1);
    });
}

