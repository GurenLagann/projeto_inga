import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionData, checkIsInstructor } from '@/lib/session';

// GET - Listar presenças
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const horarioAulaId = searchParams.get('horarioAulaId');
    const membroId = searchParams.get('membroId');
    const dataAula = searchParams.get('dataAula');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    let query = `
      SELECT
        p.id,
        p.horario_aula_id,
        p.membro_id,
        p.data_aula,
        p.presente,
        p.hora_checkin,
        p.metodo_checkin,
        p.registrado_por,
        p.observacoes,
        u.name as membro_nome,
        m.apelido as membro_apelido,
        a.name as academia_nome,
        CONCAT(h.start_time, ' - ', h.end_time) as horario_info
      FROM presencas p
      JOIN membros m ON p.membro_id = m.id
      JOIN usuarios u ON m.usuario_id = u.id
      JOIN horarios_aulas h ON p.horario_aula_id = h.id
      JOIN academias a ON h.academia_id = a.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Se não é admin, filtra apenas as presenças do próprio membro
    // ou das aulas que o instrutor é responsável
    if (session.user.admin !== 1 && session.membro) {
      const isInstructor = await checkIsInstructor(session.membro.id);
      if (isInstructor) {
        query += ` AND (p.membro_id = $${paramIndex} OR h.membro_instrutor_id = $${paramIndex})`;
      } else {
        query += ` AND p.membro_id = $${paramIndex}`;
      }
      params.push(session.membro.id);
      paramIndex++;
    }

    if (horarioAulaId) {
      query += ` AND p.horario_aula_id = $${paramIndex}`;
      params.push(parseInt(horarioAulaId));
      paramIndex++;
    }

    if (membroId) {
      query += ` AND p.membro_id = $${paramIndex}`;
      params.push(parseInt(membroId));
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

    query += ' ORDER BY p.data_aula DESC, p.hora_checkin DESC LIMIT 500';

    const result = await pool.query(query, params);

    const presencas = result.rows.map(row => ({
      id: row.id,
      horarioAulaId: row.horario_aula_id,
      membroId: row.membro_id,
      dataAula: row.data_aula,
      presente: row.presente,
      horaCheckin: row.hora_checkin,
      metodoCheckin: row.metodo_checkin,
      registradoPor: row.registrado_por,
      observacoes: row.observacoes,
      membroNome: row.membro_nome,
      membroApelido: row.membro_apelido,
      academiaNome: row.academia_nome,
      horarioInfo: row.horario_info,
    }));

    return NextResponse.json({ presencas });
  } catch (error) {
    console.error('Erro ao listar presenças:', error);
    return NextResponse.json({ error: 'Erro ao listar presenças' }, { status: 500 });
  }
}

// POST - Registrar presença
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { horarioAulaId, membroId, dataAula, presente = true, observacoes } = body;

    if (!horarioAulaId || !membroId || !dataAula) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: horarioAulaId, membroId, dataAula' },
        { status: 400 }
      );
    }

    // Verifica permissão: admin, instrutor da aula, ou o próprio membro
    const isAdmin = session.user.admin === 1;
    const isSelf = session.membro?.id === membroId;

    if (!isAdmin && !isSelf && session.membro) {
      const isInstructor = await checkIsInstructor(session.membro.id);
      if (!isInstructor) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
      }

      // Verifica se é instrutor dessa aula específica
      const aulaResult = await pool.query(
        'SELECT membro_instrutor_id FROM horarios_aulas WHERE id = $1',
        [horarioAulaId]
      );

      if (aulaResult.rows.length === 0 || aulaResult.rows[0].membro_instrutor_id !== session.membro.id) {
        return NextResponse.json(
          { error: 'Instrutor só pode registrar presença de suas próprias aulas' },
          { status: 403 }
        );
      }
    }

    const registradoPor = session.membro?.id || null;

    const result = await pool.query(
      `INSERT INTO presencas (horario_aula_id, membro_id, data_aula, presente, metodo_checkin, registrado_por, observacoes)
       VALUES ($1, $2, $3, $4, 'manual', $5, $6)
       ON CONFLICT (horario_aula_id, membro_id, data_aula)
       DO UPDATE SET presente = $4, observacoes = $6, hora_checkin = CURRENT_TIMESTAMP
       RETURNING id`,
      [horarioAulaId, membroId, dataAula, presente, registradoPor, observacoes || null]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Presença registrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    return NextResponse.json({ error: 'Erro ao registrar presença' }, { status: 500 });
  }
}

// PUT - Atualizar presença
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, presente, observacoes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da presença é obrigatório' }, { status: 400 });
    }

    // Verifica permissão
    const presencaResult = await pool.query(
      `SELECT p.*, h.membro_instrutor_id
       FROM presencas p
       JOIN horarios_aulas h ON p.horario_aula_id = h.id
       WHERE p.id = $1`,
      [id]
    );

    if (presencaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Presença não encontrada' }, { status: 404 });
    }

    const presenca = presencaResult.rows[0];
    const isAdmin = session.user.admin === 1;
    const isOwner = session.membro?.id === presenca.membro_id;
    const isClassInstructor = session.membro?.id === presenca.membro_instrutor_id;

    if (!isAdmin && !isOwner && !isClassInstructor) {
      return NextResponse.json({ error: 'Sem permissão para atualizar esta presença' }, { status: 403 });
    }

    await pool.query(
      `UPDATE presencas
       SET presente = COALESCE($2, presente),
           observacoes = COALESCE($3, observacoes)
       WHERE id = $1`,
      [id, presente, observacoes]
    );

    return NextResponse.json({ success: true, message: 'Presença atualizada' });
  } catch (error) {
    console.error('Erro ao atualizar presença:', error);
    return NextResponse.json({ error: 'Erro ao atualizar presença' }, { status: 500 });
  }
}

// DELETE - Excluir presença
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session || session.user.admin !== 1) {
      return NextResponse.json({ error: 'Apenas administradores podem excluir presenças' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da presença é obrigatório' }, { status: 400 });
    }

    await pool.query('DELETE FROM presencas WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({ success: true, message: 'Presença excluída' });
  } catch (error) {
    console.error('Erro ao excluir presença:', error);
    return NextResponse.json({ error: 'Erro ao excluir presença' }, { status: 500 });
  }
}
