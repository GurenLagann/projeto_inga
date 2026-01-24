import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Estatísticas para o dashboard admin
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (user.admin !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    // Total de alunos (membros ativos)
    const totalAlunosResult = await pool.query(`
      SELECT COUNT(*) as total FROM membros WHERE active = true
    `);

    // Total de mestres (graduação ordem = 17 - corda branca)
    const totalMestresResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM membros m
      JOIN graduacoes g ON m.graduacao_id = g.id
      WHERE m.active = true AND g.ordem = 17
    `);

    // Total de instrutores (ordem >= 15 OU quem está em horarios_aulas)
    const totalInstrutoresResult = await pool.query(`
      SELECT COUNT(DISTINCT m.id) as total
      FROM membros m
      LEFT JOIN graduacoes g ON m.graduacao_id = g.id
      LEFT JOIN horarios_aulas h ON h.membro_instrutor_id = m.id
      WHERE m.active = true AND (g.ordem >= 15 OR h.id IS NOT NULL)
    `);

    // Total de academias ativas
    const totalAcademiasResult = await pool.query(`
      SELECT COUNT(*) as total FROM academias WHERE active = true
    `);

    // Total de eventos ativos
    const totalEventosResult = await pool.query(`
      SELECT COUNT(*) as total FROM eventos WHERE active = true
    `);

    // Total de inscrições confirmadas em eventos
    const totalInscricoesResult = await pool.query(`
      SELECT COUNT(*) as total FROM inscricoes_eventos WHERE status = 'confirmada'
    `);

    // Total de presenças no mês atual
    const presencasMesResult = await pool.query(`
      SELECT COUNT(*) as total FROM presencas
      WHERE data_aula >= DATE_TRUNC('month', CURRENT_DATE)
      AND presente = true
    `);

    // Presenças da última semana
    const presencasSemanaResult = await pool.query(`
      SELECT COUNT(*) as total FROM presencas
      WHERE data_aula >= CURRENT_DATE - INTERVAL '7 days'
      AND presente = true
    `);

    return NextResponse.json({
      stats: {
        totalAlunos: parseInt(totalAlunosResult.rows[0].total) || 0,
        totalMestres: parseInt(totalMestresResult.rows[0].total) || 0,
        totalInstrutores: parseInt(totalInstrutoresResult.rows[0].total) || 0,
        totalAcademias: parseInt(totalAcademiasResult.rows[0].total) || 0,
        totalEventos: parseInt(totalEventosResult.rows[0].total) || 0,
        totalInscricoes: parseInt(totalInscricoesResult.rows[0].total) || 0,
        presencasMes: parseInt(presencasMesResult.rows[0].total) || 0,
        presencasSemana: parseInt(presencasSemanaResult.rows[0].total) || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
