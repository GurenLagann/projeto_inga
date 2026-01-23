import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Listar todos os eventos (admin)
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

    const result = await pool.query(`
      SELECT
        e.*,
        a.name as academia_nome,
        (SELECT COUNT(*) FROM inscricoes_eventos ie WHERE ie.evento_id = e.id AND ie.status != 'cancelada') as total_inscritos
      FROM eventos e
      LEFT JOIN academias a ON e.academia_id = a.id
      ORDER BY e.data_inicio DESC
    `);

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
        active: e.active,
        totalInscritos: parseInt(e.total_inscritos) || 0,
        createdAt: e.created_at,
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

// POST - Criar novo evento
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      titulo,
      descricao,
      dataInicio,
      dataFim,
      horaInicio,
      horaFim,
      local,
      tipo,
      status,
      maxParticipantes,
      permiteInscricaoPublica,
      valor,
      academiaId,
    } = body;

    if (!titulo || !dataInicio) {
      return NextResponse.json(
        { error: 'Título e data de início são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO eventos (
        titulo, descricao, data_inicio, data_fim, hora_inicio, hora_fim,
        local, tipo, status, max_participantes, permite_inscricao_publica,
        valor, academia_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        titulo,
        descricao || null,
        dataInicio,
        dataFim || null,
        horaInicio || null,
        horaFim || null,
        local || null,
        tipo || 'geral',
        status || 'confirmado',
        maxParticipantes || null,
        permiteInscricaoPublica || false,
        valor || null,
        academiaId || null,
      ]
    );

    return NextResponse.json({
      message: 'Evento criado com sucesso',
      evento: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar evento
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      id,
      titulo,
      descricao,
      dataInicio,
      dataFim,
      horaInicio,
      horaFim,
      local,
      tipo,
      status,
      maxParticipantes,
      permiteInscricaoPublica,
      valor,
      academiaId,
      active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    // Construir query dinâmica para atualizar apenas campos enviados
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (titulo !== undefined) {
      updates.push(`titulo = $${paramIndex++}`);
      values.push(titulo);
    }
    if (descricao !== undefined) {
      updates.push(`descricao = $${paramIndex++}`);
      values.push(descricao);
    }
    if (dataInicio !== undefined) {
      updates.push(`data_inicio = $${paramIndex++}`);
      values.push(dataInicio);
    }
    if (dataFim !== undefined) {
      updates.push(`data_fim = $${paramIndex++}`);
      values.push(dataFim);
    }
    if (horaInicio !== undefined) {
      updates.push(`hora_inicio = $${paramIndex++}`);
      values.push(horaInicio);
    }
    if (horaFim !== undefined) {
      updates.push(`hora_fim = $${paramIndex++}`);
      values.push(horaFim);
    }
    if (local !== undefined) {
      updates.push(`local = $${paramIndex++}`);
      values.push(local);
    }
    if (tipo !== undefined) {
      updates.push(`tipo = $${paramIndex++}`);
      values.push(tipo);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (maxParticipantes !== undefined) {
      updates.push(`max_participantes = $${paramIndex++}`);
      values.push(maxParticipantes);
    }
    if (permiteInscricaoPublica !== undefined) {
      updates.push(`permite_inscricao_publica = $${paramIndex++}`);
      values.push(permiteInscricaoPublica);
    }
    if (valor !== undefined) {
      updates.push(`valor = $${paramIndex++}`);
      values.push(valor);
    }
    if (academiaId !== undefined) {
      updates.push(`academia_id = $${paramIndex++}`);
      values.push(academiaId);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(active);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE eventos SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Evento atualizado com sucesso',
      evento: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir evento
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM eventos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Evento excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
