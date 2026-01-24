import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Listar vídeos (por categoria opcional)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const categoria = searchParams.get('categoria');

    let query = `
      SELECT
        id, titulo, descricao, categoria, url_video, thumbnail_url,
        duracao, nivel, instrutor_nome, ordem, active, created_at
      FROM video_aulas
      WHERE active = true
    `;
    const params: string[] = [];

    if (categoria) {
      query += ' AND categoria = $1';
      params.push(categoria);
    }

    query += ' ORDER BY categoria, ordem, created_at DESC';

    const result = await pool.query(query, params);

    const videos = result.rows.map(row => ({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      categoria: row.categoria,
      urlVideo: row.url_video,
      thumbnailUrl: row.thumbnail_url,
      duracao: row.duracao,
      nivel: row.nivel,
      instrutorNome: row.instrutor_nome,
      ordem: row.ordem,
      createdAt: row.created_at,
    }));

    // Agrupa por categoria
    const videosPorCategoria = {
      movimentacoes: videos.filter(v => v.categoria === 'movimentacoes'),
      musicalidade: videos.filter(v => v.categoria === 'musicalidade'),
      historia: videos.filter(v => v.categoria === 'historia'),
    };

    return NextResponse.json({ videos, videosPorCategoria });
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    return NextResponse.json({ error: 'Erro ao listar vídeos' }, { status: 500 });
  }
}

// POST - Criar novo vídeo (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.admin !== 1) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const body = await request.json();
    const { titulo, descricao, categoria, urlVideo, thumbnailUrl, duracao, nivel, instrutorNome, ordem } = body;

    if (!titulo || !categoria || !urlVideo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: titulo, categoria, urlVideo' },
        { status: 400 }
      );
    }

    if (!['movimentacoes', 'musicalidade', 'historia'].includes(categoria)) {
      return NextResponse.json(
        { error: 'Categoria inválida. Use: movimentacoes, musicalidade ou historia' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO video_aulas
        (titulo, descricao, categoria, url_video, thumbnail_url, duracao, nivel, instrutor_nome, ordem, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [titulo, descricao || null, categoria, urlVideo, thumbnailUrl || null, duracao || null, nivel || null, instrutorNome || null, ordem || 0, user.id]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Vídeo adicionado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
    return NextResponse.json({ error: 'Erro ao criar vídeo' }, { status: 500 });
  }
}

// PUT - Atualizar vídeo (apenas admin)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.admin !== 1) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const body = await request.json();
    const { id, titulo, descricao, categoria, urlVideo, thumbnailUrl, duracao, nivel, instrutorNome, ordem, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do vídeo é obrigatório' }, { status: 400 });
    }

    if (categoria && !['movimentacoes', 'musicalidade', 'historia'].includes(categoria)) {
      return NextResponse.json(
        { error: 'Categoria inválida. Use: movimentacoes, musicalidade ou historia' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE video_aulas SET
        titulo = COALESCE($1, titulo),
        descricao = COALESCE($2, descricao),
        categoria = COALESCE($3, categoria),
        url_video = COALESCE($4, url_video),
        thumbnail_url = COALESCE($5, thumbnail_url),
        duracao = COALESCE($6, duracao),
        nivel = COALESCE($7, nivel),
        instrutor_nome = COALESCE($8, instrutor_nome),
        ordem = COALESCE($9, ordem),
        active = COALESCE($10, active)
       WHERE id = $11`,
      [titulo, descricao, categoria, urlVideo, thumbnailUrl, duracao, nivel, instrutorNome, ordem, active, id]
    );

    return NextResponse.json({ success: true, message: 'Vídeo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    return NextResponse.json({ error: 'Erro ao atualizar vídeo' }, { status: 500 });
  }
}

// DELETE - Remover vídeo (apenas admin)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.admin !== 1) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do vídeo é obrigatório' }, { status: 400 });
    }

    // Soft delete
    await pool.query('UPDATE video_aulas SET active = false WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Vídeo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover vídeo:', error);
    return NextResponse.json({ error: 'Erro ao remover vídeo' }, { status: 500 });
  }
}
