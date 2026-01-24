import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionDataWithInstructor } from '@/lib/session';

// GET - Aulas do instrutor (ou todas as aulas para admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionDataWithInstructor();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const isAdmin = session.user.admin === 1;

    if (!session.membro && !isAdmin) {
      return NextResponse.json({ error: 'Você precisa ser um membro' }, { status: 403 });
    }

    if (!session.isInstructor && !isAdmin) {
      return NextResponse.json({ error: 'Acesso restrito a instrutores' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const academiaId = searchParams.get('academiaId');
    const instrutorIdParam = searchParams.get('instrutorId');
    const instrutorId = instrutorIdParam ? parseInt(instrutorIdParam) : null;

    // Admin pode filtrar por instrutor específico
    // Admin sem membro ou que não é instrutor vê todas as aulas (se não especificar instrutorId)
    const isAdminViewingAll = isAdmin && (!session.membro || !session.isInstructor) && !instrutorId;
    const targetInstrutorId = instrutorId || (session.membro?.id ?? null);

    let query = `
      SELECT
        h.id,
        h.academia_id,
        a.name as academia_nome,
        h.day_of_week as dia_semana,
        h.start_time as hora_inicio,
        h.end_time as hora_fim,
        h.class_type as tipo_aula,
        h.description as descricao,
        u.name as instrutor_nome,
        m.apelido as instrutor_apelido,
        (SELECT COUNT(DISTINCT p.membro_id)
         FROM presencas p
         WHERE p.horario_aula_id = h.id
         AND p.data_aula >= CURRENT_DATE - INTERVAL '30 days') as total_alunos
      FROM horarios_aulas h
      JOIN academias a ON h.academia_id = a.id
      LEFT JOIN membros m ON h.membro_instrutor_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE h.active = true
    `;
    const params: (number | string)[] = [];
    let paramIndex = 1;

    if (!isAdminViewingAll && targetInstrutorId) {
      query += ` AND h.membro_instrutor_id = $${paramIndex}`;
      params.push(targetInstrutorId);
      paramIndex++;
    }

    if (academiaId) {
      query += ` AND h.academia_id = $${paramIndex}`;
      params.push(parseInt(academiaId));
      paramIndex++;
    }

    query += ' ORDER BY h.day_of_week, h.start_time';

    const result = await pool.query(query, params);

    const aulas = result.rows.map(row => ({
      id: row.id,
      academiaId: row.academia_id,
      academiaNome: row.academia_nome,
      diaSemana: row.dia_semana,
      horaInicio: row.hora_inicio,
      horaFim: row.hora_fim,
      tipoAula: row.tipo_aula,
      descricao: row.descricao,
      totalAlunos: parseInt(row.total_alunos) || 0,
      instrutorNome: row.instrutor_apelido || row.instrutor_nome || null,
    }));

    return NextResponse.json({ aulas });
  } catch (error) {
    console.error('Erro ao buscar aulas do instrutor:', error);
    return NextResponse.json({ error: 'Erro ao buscar aulas' }, { status: 500 });
  }
}
