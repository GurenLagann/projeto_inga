import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

// GET - Estatísticas de crescimento
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.admin !== 1) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || '12'; // meses
    const tipo = searchParams.get('tipo') || 'mensal'; // mensal, semanal

    // Estatísticas gerais
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM membros WHERE active = true) as total_membros,
        (SELECT COUNT(*) FROM membros WHERE active = true AND created_at >= CURRENT_DATE - INTERVAL '30 days') as novos_30_dias,
        (SELECT COUNT(*) FROM membros WHERE active = true AND created_at >= CURRENT_DATE - INTERVAL '7 days') as novos_7_dias,
        (SELECT COUNT(*) FROM academias WHERE active = true) as total_academias,
        (SELECT COUNT(*) FROM eventos WHERE active = true AND data_inicio >= CURRENT_DATE) as proximos_eventos,
        (SELECT COUNT(*) FROM presencas WHERE data_aula >= CURRENT_DATE - INTERVAL '30 days' AND presente = true) as presencas_30_dias
    `);

    const stats = statsResult.rows[0];

    // Crescimento por período
    let crescimentoQuery = '';
    if (tipo === 'mensal') {
      crescimentoQuery = `
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as periodo,
          COUNT(*) as novos_membros
        FROM membros
        WHERE active = true
          AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(periodo)} months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `;
    } else {
      crescimentoQuery = `
        SELECT
          TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-"W"IW') as periodo,
          COUNT(*) as novos_membros
        FROM membros
        WHERE active = true
          AND created_at >= CURRENT_DATE - INTERVAL '${Math.min(parseInt(periodo), 52)} weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY DATE_TRUNC('week', created_at)
      `;
    }

    const crescimentoResult = await pool.query(crescimentoQuery);

    // Calcula total acumulado
    let totalAcumulado = 0;
    const crescimento = crescimentoResult.rows.map(row => {
      totalAcumulado += parseInt(row.novos_membros);
      return {
        periodo: row.periodo,
        novosAlunos: parseInt(row.novos_membros),
        total: totalAcumulado,
      };
    });

    // Distribuição por graduação
    const graduacaoResult = await pool.query(`
      SELECT
        g.nome as graduacao,
        g.cor_primaria,
        g.ordem,
        COUNT(m.id) as quantidade
      FROM graduacoes g
      LEFT JOIN membros m ON m.graduacao_id = g.id AND m.active = true
      GROUP BY g.id, g.nome, g.cor_primaria, g.ordem
      ORDER BY g.ordem
    `);

    const distribuicaoGraduacao = graduacaoResult.rows.map(row => ({
      graduacao: row.graduacao,
      cor: row.cor_primaria,
      quantidade: parseInt(row.quantidade) || 0,
    }));

    // Distribuição por academia
    const academiaResult = await pool.query(`
      SELECT
        a.name as academia,
        a.city as cidade,
        COUNT(m.id) as total_membros
      FROM academias a
      LEFT JOIN membros m ON m.academia_id = a.id AND m.active = true
      WHERE a.active = true
      GROUP BY a.id, a.name, a.city
      ORDER BY COUNT(m.id) DESC
    `);

    const distribuicaoAcademia = academiaResult.rows.map(row => ({
      academia: row.academia,
      cidade: row.cidade,
      totalMembros: parseInt(row.total_membros) || 0,
    }));

    // Taxa de retenção (membros com presença nos últimos 30 dias / total)
    const retencaoResult = await pool.query(`
      SELECT
        (SELECT COUNT(DISTINCT membro_id) FROM presencas WHERE data_aula >= CURRENT_DATE - INTERVAL '30 days' AND presente = true) as ativos_30_dias,
        (SELECT COUNT(*) FROM membros WHERE active = true) as total
    `);

    const retencao = retencaoResult.rows[0];
    const taxaRetencao = retencao.total > 0
      ? Math.round((parseInt(retencao.ativos_30_dias) / parseInt(retencao.total)) * 100)
      : 0;

    return NextResponse.json({
      estatisticas: {
        totalMembros: parseInt(stats.total_membros) || 0,
        novos30Dias: parseInt(stats.novos_30_dias) || 0,
        novos7Dias: parseInt(stats.novos_7_dias) || 0,
        totalAcademias: parseInt(stats.total_academias) || 0,
        proximosEventos: parseInt(stats.proximos_eventos) || 0,
        presencas30Dias: parseInt(stats.presencas_30_dias) || 0,
        taxaRetencao,
      },
      crescimento,
      distribuicaoGraduacao,
      distribuicaoAcademia,
    });
  } catch (error) {
    console.error('Erro ao gerar estatísticas de crescimento:', error);
    return NextResponse.json({ error: 'Erro ao gerar estatísticas' }, { status: 500 });
  }
}
