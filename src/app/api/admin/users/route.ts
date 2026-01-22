import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { pool } from '@/lib/db';

// GET - Listar todos os usuários (apenas admin)
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar.' },
        { status: 401 }
      );
    }

    if (user.admin !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.admin, u.created_at,
              m.id as membro_id, m.apelido,
              g.nome as graduacao_nome, g.corda, g.cor_primaria, g.cor_secundaria,
              a.name as academia_nome
       FROM usuarios u
       LEFT JOIN membros m ON m.usuario_id = u.id AND m.active = true
       LEFT JOIN graduacoes g ON m.graduacao_id = g.id
       LEFT JOIN academias a ON m.academia_id = a.id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({
      users: result.rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        admin: u.admin,
        createdAt: u.created_at,
        membro: u.membro_id ? {
          id: u.membro_id,
          apelido: u.apelido,
          graduacaoNome: u.graduacao_nome,
          corda: u.corda,
          corPrimaria: u.cor_primaria,
          corSecundaria: u.cor_secundaria,
          academiaNome: u.academia_nome,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário (toggle admin, etc)
export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar.' },
        { status: 401 }
      );
    }

    if (sessionUser.admin !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, admin } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Não permitir que o admin remova seu próprio acesso de admin
    if (userId === sessionUser.id && admin === 0) {
      return NextResponse.json(
        { error: 'Você não pode remover seu próprio acesso de administrador' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE usuarios SET admin = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, admin`,
      [admin, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar.' },
        { status: 401 }
      );
    }

    if (sessionUser.admin !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Não permitir que o admin exclua a si mesmo
    if (parseInt(userId) === sessionUser.id) {
      return NextResponse.json(
        { error: 'Você não pode excluir sua própria conta' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id, name',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Usuário excluído com sucesso',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
