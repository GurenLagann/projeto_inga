import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Listar todos os membros (para admin)
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
        m.id,
        m.apelido,
        m.active,
        u.id as usuario_id,
        u.name as usuario_nome,
        u.email as usuario_email,
        g.id as graduacao_id,
        g.nome as graduacao_nome,
        g.corda as graduacao_corda,
        g.cor_primaria,
        g.cor_secundaria,
        a.id as academia_id,
        a.name as academia_nome
      FROM membros m
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN graduacoes g ON m.graduacao_id = g.id
      LEFT JOIN academias a ON m.academia_id = a.id
      WHERE m.active = true
      ORDER BY u.name ASC
    `);

    return NextResponse.json({
      membros: result.rows.map(m => ({
        id: m.id,
        apelido: m.apelido,
        active: m.active,
        usuarioId: m.usuario_id,
        usuarioNome: m.usuario_nome,
        usuarioEmail: m.usuario_email,
        graduacaoId: m.graduacao_id,
        graduacaoNome: m.graduacao_nome,
        graduacaoCorda: m.graduacao_corda,
        corPrimaria: m.cor_primaria,
        corSecundaria: m.cor_secundaria,
        academiaId: m.academia_id,
        academiaNome: m.academia_nome,
        // Nome para exibição: apelido ou nome do usuário
        displayName: m.apelido || m.usuario_nome,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar membros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados do membro
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
      apelido,
      graduacaoId,
      academiaId,
      mestreId,
      dataEntrada,
      dataBatizado,
      active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do membro é obrigatório' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE membros SET
        apelido = COALESCE($1, apelido),
        graduacao_id = $2,
        academia_id = $3,
        mestre_id = $4,
        data_entrada = $5,
        data_batizado = $6,
        active = COALESCE($7, active)
      WHERE id = $8
      RETURNING *`,
      [
        apelido,
        graduacaoId || null,
        academiaId || null,
        mestreId || null,
        dataEntrada || null,
        dataBatizado || null,
        active,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Membro atualizado com sucesso',
      membro: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
