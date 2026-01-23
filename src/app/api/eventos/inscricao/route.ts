import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Verificar se usuário já está inscrito em um evento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');

    if (!eventoId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({
        inscrito: false,
        inscricao: null,
      });
    }

    // Verificar se o usuário logado já está inscrito
    const result = await pool.query(`
      SELECT ie.* FROM inscricoes_eventos ie
      LEFT JOIN membros m ON ie.membro_id = m.id
      WHERE ie.evento_id = $1
      AND (ie.usuario_id = $2 OR m.usuario_id = $2)
    `, [eventoId, user.id]);

    if (result.rows.length > 0) {
      return NextResponse.json({
        inscrito: true,
        inscricao: {
          id: result.rows[0].id,
          status: result.rows[0].status,
          dataInscricao: result.rows[0].data_inscricao,
        },
      });
    }

    return NextResponse.json({
      inscrito: false,
      inscricao: null,
    });
  } catch (error) {
    console.error('Erro ao verificar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar inscrição em evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventoId, nomeExterno, emailExterno, telefoneExterno } = body;

    if (!eventoId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o evento existe e aceita inscrições
    const eventoResult = await pool.query(
      'SELECT * FROM eventos WHERE id = $1 AND active = true',
      [eventoId]
    );

    if (eventoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    const evento = eventoResult.rows[0];

    // Verificar limite de participantes
    if (evento.max_participantes) {
      const inscritosResult = await pool.query(
        "SELECT COUNT(*) as total FROM inscricoes_eventos WHERE evento_id = $1 AND status != 'cancelada'",
        [eventoId]
      );
      const totalInscritos = parseInt(inscritosResult.rows[0].total) || 0;

      if (totalInscritos >= evento.max_participantes) {
        return NextResponse.json(
          { error: 'Evento lotado. Não há mais vagas disponíveis.' },
          { status: 400 }
        );
      }
    }

    const user = await getSessionUser();

    // Se usuário está logado, inscrever com membro/usuario
    if (user) {
      // Verificar se já está inscrito
      const existsResult = await pool.query(`
        SELECT ie.id FROM inscricoes_eventos ie
        LEFT JOIN membros m ON ie.membro_id = m.id
        WHERE ie.evento_id = $1
        AND (ie.usuario_id = $2 OR m.usuario_id = $2)
      `, [eventoId, user.id]);

      if (existsResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Você já está inscrito neste evento' },
          { status: 400 }
        );
      }

      // Verificar se usuário tem membro associado
      const membroResult = await pool.query(
        'SELECT id FROM membros WHERE usuario_id = $1 AND active = true',
        [user.id]
      );

      const membroId = membroResult.rows.length > 0 ? membroResult.rows[0].id : null;

      const result = await pool.query(
        `INSERT INTO inscricoes_eventos (evento_id, membro_id, usuario_id, status)
        VALUES ($1, $2, $3, 'confirmada')
        RETURNING *`,
        [eventoId, membroId, user.id]
      );

      return NextResponse.json({
        message: 'Inscrição realizada com sucesso',
        inscricao: result.rows[0],
      });
    }

    // Se não está logado, verificar se evento permite inscrição pública
    if (!evento.permite_inscricao_publica) {
      return NextResponse.json(
        { error: 'Este evento requer login para inscrição' },
        { status: 401 }
      );
    }

    // Validar dados externos
    if (!nomeExterno || !emailExterno) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já inscrito
    const existsExternalResult = await pool.query(
      'SELECT id FROM inscricoes_eventos WHERE evento_id = $1 AND email_externo = $2',
      [eventoId, emailExterno]
    );

    if (existsExternalResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este email já está inscrito neste evento' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO inscricoes_eventos (evento_id, nome_externo, email_externo, telefone_externo, status)
      VALUES ($1, $2, $3, $4, 'confirmada')
      RETURNING *`,
      [eventoId, nomeExterno, emailExterno, telefoneExterno || null]
    );

    return NextResponse.json({
      message: 'Inscrição realizada com sucesso',
      inscricao: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar inscrição
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');

    if (!eventoId) {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório' },
        { status: 400 }
      );
    }

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Atualizar status para cancelada (não exclui para manter histórico)
    const result = await pool.query(`
      UPDATE inscricoes_eventos ie
      SET status = 'cancelada'
      FROM membros m
      WHERE ie.evento_id = $1
      AND (ie.usuario_id = $2 OR (ie.membro_id = m.id AND m.usuario_id = $2))
      RETURNING ie.id
    `, [eventoId, user.id]);

    // Se não atualizou pela query com JOIN, tentar diretamente pelo usuario_id
    if (result.rowCount === 0) {
      const directResult = await pool.query(`
        UPDATE inscricoes_eventos
        SET status = 'cancelada'
        WHERE evento_id = $1 AND usuario_id = $2
        RETURNING id
      `, [eventoId, user.id]);

      if (directResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'Inscrição não encontrada' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      message: 'Inscrição cancelada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
