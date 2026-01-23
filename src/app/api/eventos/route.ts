import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Listar eventos públicos (futuros ou em andamento)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true'; // Admin pode ver todos

    let query = `
      SELECT
        e.*,
        a.name as academia_nome,
        (SELECT COUNT(*) FROM inscricoes_eventos ie WHERE ie.evento_id = e.id AND ie.status != 'cancelada') as total_inscritos
      FROM eventos e
      LEFT JOIN academias a ON e.academia_id = a.id
      WHERE e.active = true
    `;

    // Se não for "all", mostrar apenas eventos futuros ou em andamento
    if (!includeAll) {
      query += ` AND (e.data_inicio >= CURRENT_DATE OR (e.data_fim IS NOT NULL AND e.data_fim >= CURRENT_DATE))`;
    }

    query += ` ORDER BY e.data_inicio ASC`;

    const result = await pool.query(query);

    return NextResponse.json({
      eventos: result.rows.map(e => ({
        id: e.id,
        titulo: e.titulo,
        descricao: e.descricao,
        dataInicio: e.data_inicio,
        dataFim: e.data_fim,
        horaInicio: e.hora_inicio,
        horaFim: e.hora_fim,
        local: e.local,
        tipo: e.tipo,
        status: e.status,
        maxParticipantes: e.max_participantes,
        permiteInscricaoPublica: e.permite_inscricao_publica,
        valor: e.valor ? parseFloat(e.valor) : null,
        academiaId: e.academia_id,
        academiaNome: e.academia_nome,
        totalInscritos: parseInt(e.total_inscritos) || 0,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
