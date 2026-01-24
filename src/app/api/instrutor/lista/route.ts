import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Lista todos os instrutores (apenas para admin)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.admin !== 1) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    // Busca todos os instrutores (membros que têm aulas ou graduação de instrutor/mestre)
    const result = await pool.query(`
      SELECT DISTINCT
        m.id,
        u.name as nome,
        m.apelido,
        g.nome as graduacao,
        g.cor_primaria,
        (SELECT COUNT(*) FROM horarios_aulas h WHERE h.membro_instrutor_id = m.id AND h.active = true) as total_aulas,
        (SELECT COUNT(DISTINCT ha.academia_id)
         FROM horarios_aulas ha
         WHERE ha.membro_instrutor_id = m.id AND ha.active = true) as total_academias
      FROM membros m
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN graduacoes g ON m.graduacao_id = g.id
      WHERE m.active = true
        AND (
          -- Tem aulas cadastradas
          EXISTS (SELECT 1 FROM horarios_aulas h WHERE h.membro_instrutor_id = m.id AND h.active = true)
          -- OU tem graduação de instrutor/mestre
          OR g.tipo IN ('formado', 'mestre')
          OR LOWER(g.nome) LIKE '%instrutor%'
          OR LOWER(g.nome) LIKE '%professor%'
          OR LOWER(g.nome) LIKE '%contra-mestre%'
          OR LOWER(g.nome) LIKE '%contramestre%'
          OR LOWER(g.nome) LIKE '%mestre%'
        )
      ORDER BY u.name
    `);

    const instrutores = result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      apelido: row.apelido,
      graduacao: row.graduacao,
      corPrimaria: row.cor_primaria,
      totalAulas: parseInt(row.total_aulas) || 0,
      totalAcademias: parseInt(row.total_academias) || 0,
    }));

    return NextResponse.json({ instrutores });
  } catch (error) {
    console.error('Erro ao listar instrutores:', error);
    return NextResponse.json({ error: 'Erro ao listar instrutores' }, { status: 500 });
  }
}
