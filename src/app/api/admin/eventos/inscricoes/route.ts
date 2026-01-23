import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Listar inscrições de um evento
export async function GET(request: NextRequest) {
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
    const eventoId = searchParams.get('eventoId');

    if (!eventoId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    const result = await pool.query(`
      SELECT
        ie.*,
        m.apelido as membro_apelido,
        u.name as usuario_nome,
        u.email as usuario_email,
        u.phone as usuario_phone
      FROM inscricoes_eventos ie
      LEFT JOIN membros m ON ie.membro_id = m.id
      LEFT JOIN usuarios u ON ie.usuario_id = u.id
      WHERE ie.evento_id = $1
      ORDER BY ie.data_inscricao DESC
    `, [eventoId]);

    return NextResponse.json({
      inscricoes: result.rows.map(i => ({
        id: i.id,
        eventoId: i.evento_id,
        membroId: i.membro_id,
        usuarioId: i.usuario_id,
        nomeExterno: i.nome_externo,
        emailExterno: i.email_externo,
        telefoneExterno: i.telefone_externo,
        status: i.status,
        dataInscricao: i.data_inscricao,
        // Dados relacionados para exibição
        membroApelido: i.membro_apelido,
        usuarioNome: i.usuario_nome,
        usuarioEmail: i.usuario_email,
        usuarioPhone: i.usuario_phone,
        // Nome para exibição
        displayName: i.membro_apelido || i.usuario_nome || i.nome_externo || 'Sem nome',
        displayEmail: i.usuario_email || i.email_externo || '-',
        displayPhone: i.usuario_phone || i.telefone_externo || '-',
      })),
    });
  } catch (error) {
    console.error('Erro ao listar inscrições:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar status da inscrição
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      );
    }

    const validStatus = ['pendente', 'confirmada', 'cancelada', 'presente'];
    if (!validStatus.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'UPDATE inscricoes_eventos SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Status atualizado com sucesso',
      inscricao: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover inscrição
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
        { error: 'ID da inscrição é obrigatório' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM inscricoes_eventos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Inscrição removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
