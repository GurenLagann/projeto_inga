import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionDataWithInstructor } from '@/lib/session';

// GET - Listar presenças das aulas do instrutor (ou todas para admin)
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
    const horarioAulaId = searchParams.get('horarioAulaId');
    const dataAula = searchParams.get('dataAula');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const instrutorIdParam = searchParams.get('instrutorId');
    const instrutorId = instrutorIdParam ? parseInt(instrutorIdParam) : null;

    // Admin pode filtrar por instrutor específico
    // Admin sem membro ou que não é instrutor vê todas as presenças (se não especificar instrutorId)
    const isAdminViewingAll = isAdmin && (!session.membro || !session.isInstructor) && !instrutorId;
    const targetInstrutorId = instrutorId || (session.membro?.id ?? null);

    let query = `
      SELECT
        p.id,
        p.horario_aula_id,
        p.membro_id,
        p.data_aula,
        p.presente,
        p.hora_checkin,
        p.metodo_checkin,
        p.observacoes,
        u.name as membro_nome,
        m.apelido as membro_apelido,
        a.name as academia_nome,
        h.start_time,
        h.end_time,
        ui.name as instrutor_nome,
        mi.apelido as instrutor_apelido
      FROM presencas p
      JOIN membros m ON p.membro_id = m.id
      JOIN usuarios u ON m.usuario_id = u.id
      JOIN horarios_aulas h ON p.horario_aula_id = h.id
      JOIN academias a ON h.academia_id = a.id
      LEFT JOIN membros mi ON h.membro_instrutor_id = mi.id
      LEFT JOIN usuarios ui ON mi.usuario_id = ui.id
      WHERE 1=1
    `;
    const params: (number | string)[] = [];
    let paramIndex = 1;

    if (!isAdminViewingAll && targetInstrutorId) {
      query += ` AND h.membro_instrutor_id = $${paramIndex}`;
      params.push(targetInstrutorId);
      paramIndex++;
    }

    if (horarioAulaId) {
      query += ` AND p.horario_aula_id = $${paramIndex}`;
      params.push(parseInt(horarioAulaId));
      paramIndex++;
    }

    if (dataAula) {
      query += ` AND p.data_aula = $${paramIndex}`;
      params.push(dataAula);
      paramIndex++;
    }

    if (dataInicio) {
      query += ` AND p.data_aula >= $${paramIndex}`;
      params.push(dataInicio);
      paramIndex++;
    }

    if (dataFim) {
      query += ` AND p.data_aula <= $${paramIndex}`;
      params.push(dataFim);
      paramIndex++;
    }

    query += ' ORDER BY p.data_aula DESC, h.start_time LIMIT 500';

    const result = await pool.query(query, params);

    const presencas = result.rows.map(row => ({
      id: row.id,
      horarioAulaId: row.horario_aula_id,
      membroId: row.membro_id,
      dataAula: row.data_aula,
      presente: row.presente,
      horaCheckin: row.hora_checkin,
      metodoCheckin: row.metodo_checkin,
      observacoes: row.observacoes,
      membroNome: row.membro_nome,
      membroApelido: row.membro_apelido,
      academiaNome: row.academia_nome,
      horarioInfo: `${row.start_time} - ${row.end_time}`,
      instrutorNome: row.instrutor_apelido || row.instrutor_nome || null,
    }));

    return NextResponse.json({ presencas });
  } catch (error) {
    console.error('Erro ao listar presenças:', error);
    return NextResponse.json({ error: 'Erro ao listar presenças' }, { status: 500 });
  }
}

// POST - Registrar presenças em lote
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { horarioAulaId, dataAula, presencas } = body;

    if (!horarioAulaId || !dataAula || !presencas || !Array.isArray(presencas)) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: horarioAulaId, dataAula, presencas (array)' },
        { status: 400 }
      );
    }

    // Verifica se é instrutor dessa aula (admin pode em qualquer aula)
    const aulaResult = await pool.query(
      'SELECT membro_instrutor_id FROM horarios_aulas WHERE id = $1',
      [horarioAulaId]
    );

    if (aulaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
    }

    if (!isAdmin && session.membro && aulaResult.rows[0].membro_instrutor_id !== session.membro.id) {
      return NextResponse.json(
        { error: 'Você só pode marcar presença em suas próprias aulas' },
        { status: 403 }
      );
    }

    // Registra as presenças em lote
    // Para admin sem membro, usa null como registrado_por
    const registradoPor = session.membro?.id || null;
    let registradas = 0;
    for (const presenca of presencas) {
      const { membroId, presente, observacoes } = presenca;

      if (!membroId) continue;

      await pool.query(
        `INSERT INTO presencas (horario_aula_id, membro_id, data_aula, presente, metodo_checkin, registrado_por, observacoes)
         VALUES ($1, $2, $3, $4, 'manual', $5, $6)
         ON CONFLICT (horario_aula_id, membro_id, data_aula)
         DO UPDATE SET presente = $4, observacoes = $6, hora_checkin = CURRENT_TIMESTAMP`,
        [horarioAulaId, membroId, dataAula, presente ?? true, registradoPor, observacoes || null]
      );
      registradas++;
    }

    return NextResponse.json({
      success: true,
      message: `${registradas} presença(s) registrada(s) com sucesso`,
      registradas,
    });
  } catch (error) {
    console.error('Erro ao registrar presenças:', error);
    return NextResponse.json({ error: 'Erro ao registrar presenças' }, { status: 500 });
  }
}
