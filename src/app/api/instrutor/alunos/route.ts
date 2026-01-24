import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionDataWithInstructor } from '@/lib/session';

// GET - Alunos que frequentam as aulas do instrutor (ou todas as aulas para admin)
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
    const horarioAulaId = searchParams.get('horarioAulaId');
    const instrutorIdParam = searchParams.get('instrutorId');
    const instrutorId = instrutorIdParam ? parseInt(instrutorIdParam) : null;

    // Admin pode filtrar por instrutor específico
    // Admin sem membro ou que não é instrutor vê todos os alunos (se não especificar instrutorId)
    const isAdminViewingAll = isAdmin && (!session.membro || !session.isInstructor) && !instrutorId;
    const targetInstrutorId = instrutorId || (session.membro?.id ?? null);

    let query: string;
    const params: (number | string)[] = [];
    let paramIndex = 1;

    if (isAdminViewingAll) {
      // Admin vê todos os alunos com presenças
      query = `
        SELECT DISTINCT
          m.id,
          u.name as nome,
          m.apelido,
          u.email,
          g.nome as graduacao,
          g.cor_primaria as graduacao_cor,
          (SELECT COUNT(*) FROM presencas p WHERE p.membro_id = m.id AND p.presente = true) as total_presencas,
          (SELECT MAX(p.data_aula) FROM presencas p WHERE p.membro_id = m.id AND p.presente = true) as ultima_presenca
        FROM membros m
        JOIN usuarios u ON m.usuario_id = u.id
        LEFT JOIN graduacoes g ON m.graduacao_id = g.id
        JOIN presencas p ON p.membro_id = m.id
        JOIN horarios_aulas h ON p.horario_aula_id = h.id
        WHERE m.active = true
      `;
    } else if (targetInstrutorId) {
      // Instrutor ou admin visualizando instrutor específico
      query = `
        SELECT DISTINCT
          m.id,
          u.name as nome,
          m.apelido,
          u.email,
          g.nome as graduacao,
          g.cor_primaria as graduacao_cor,
          (SELECT COUNT(*) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE p.membro_id = m.id AND h.membro_instrutor_id = $1 AND p.presente = true) as total_presencas,
          (SELECT MAX(p.data_aula) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE p.membro_id = m.id AND h.membro_instrutor_id = $1 AND p.presente = true) as ultima_presenca
        FROM membros m
        JOIN usuarios u ON m.usuario_id = u.id
        LEFT JOIN graduacoes g ON m.graduacao_id = g.id
        JOIN presencas p ON p.membro_id = m.id
        JOIN horarios_aulas h ON p.horario_aula_id = h.id
        WHERE h.membro_instrutor_id = $1 AND m.active = true
      `;
      params.push(targetInstrutorId);
      paramIndex = 2;
    } else {
      // Fallback - não deveria chegar aqui
      return NextResponse.json({ alunos: [] });
    }

    if (academiaId) {
      query += ` AND h.academia_id = $${paramIndex}`;
      params.push(parseInt(academiaId));
      paramIndex++;
    }

    if (horarioAulaId) {
      query += ` AND h.id = $${paramIndex}`;
      params.push(parseInt(horarioAulaId));
      paramIndex++;
    }

    query += ' ORDER BY u.name';

    const result = await pool.query(query, params);

    const alunos = result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      apelido: row.apelido,
      email: row.email,
      graduacao: row.graduacao,
      graduacaoCor: row.graduacao_cor,
      totalPresencas: parseInt(row.total_presencas) || 0,
      ultimaPresenca: row.ultima_presenca,
    }));

    return NextResponse.json({ alunos });
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return NextResponse.json({ error: 'Erro ao buscar alunos' }, { status: 500 });
  }
}
