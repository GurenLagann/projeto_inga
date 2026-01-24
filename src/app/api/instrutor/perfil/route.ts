import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionDataWithInstructor } from '@/lib/session';

// GET - Perfil do instrutor (ou visão geral para admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionDataWithInstructor();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const isAdmin = session.user.admin === 1;

    // Admin sem membro pode acessar, mas verá dados gerais
    if (!session.membro && !isAdmin) {
      return NextResponse.json({ error: 'Você precisa ser um membro' }, { status: 403 });
    }

    if (!session.isInstructor && !isAdmin) {
      return NextResponse.json({ error: 'Acesso restrito a instrutores' }, { status: 403 });
    }

    // Admin pode filtrar por instrutor específico
    const searchParams = request.nextUrl.searchParams;
    const instrutorIdParam = searchParams.get('instrutorId');
    const instrutorId = instrutorIdParam ? parseInt(instrutorIdParam) : null;

    // Determina qual instrutor mostrar
    let targetInstrutorId: number | null = null;
    let isAdminViewingAll = false;
    let isAdminViewingSpecific = false;

    if (isAdmin && instrutorId) {
      // Admin visualizando instrutor específico
      targetInstrutorId = instrutorId;
      isAdminViewingSpecific = true;
    } else if (isAdmin && (!session.membro || !session.isInstructor)) {
      // Admin sem membro ou não-instrutor vê visão geral
      isAdminViewingAll = true;
    } else if (session.membro) {
      // Instrutor ou admin-instrutor vê seus próprios dados
      targetInstrutorId = session.membro.id;
    }

    let statsResult;
    let academiasResult;
    let perfilData;

    if (isAdminViewingAll) {
      // Admin vê estatísticas de todos os instrutores
      statsResult = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM horarios_aulas WHERE active = true) as total_aulas,
          (SELECT COUNT(DISTINCT membro_id) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id) as total_alunos_distintos,
          (SELECT COUNT(*) FROM presencas p
           WHERE p.presente = true
           AND p.data_aula >= CURRENT_DATE - INTERVAL '30 days') as presencas_mes,
          (SELECT COUNT(*) FROM presencas p
           WHERE p.presente = true
           AND p.data_aula >= CURRENT_DATE - INTERVAL '7 days') as presencas_semana`
      );

      academiasResult = await pool.query(
        `SELECT DISTINCT a.id, a.name, a.city
         FROM horarios_aulas h
         JOIN academias a ON h.academia_id = a.id
         WHERE h.active = true AND a.active = true`
      );

      perfilData = {
        id: 0,
        nome: 'Visão Geral',
        apelido: 'Todos os Instrutores',
        email: session.user.email,
        graduacao: null,
        corda: null,
        corPrimaria: null,
        corSecundaria: null,
      };
    } else if (isAdminViewingSpecific && targetInstrutorId) {
      // Admin visualizando instrutor específico
      const instrutorResult = await pool.query(
        `SELECT m.id, m.apelido, u.name, u.email, g.nome as graduacao, g.corda, g.cor_primaria, g.cor_secundaria
         FROM membros m
         JOIN usuarios u ON m.usuario_id = u.id
         LEFT JOIN graduacoes g ON m.graduacao_id = g.id
         WHERE m.id = $1`,
        [targetInstrutorId]
      );

      if (instrutorResult.rows.length === 0) {
        return NextResponse.json({ error: 'Instrutor não encontrado' }, { status: 404 });
      }

      const instrutor = instrutorResult.rows[0];
      perfilData = {
        id: instrutor.id,
        nome: instrutor.name,
        apelido: instrutor.apelido,
        email: instrutor.email,
        graduacao: instrutor.graduacao,
        corda: instrutor.corda,
        corPrimaria: instrutor.cor_primaria,
        corSecundaria: instrutor.cor_secundaria,
      };

      statsResult = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM horarios_aulas WHERE membro_instrutor_id = $1 AND active = true) as total_aulas,
          (SELECT COUNT(DISTINCT membro_id) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE h.membro_instrutor_id = $1) as total_alunos_distintos,
          (SELECT COUNT(*) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE h.membro_instrutor_id = $1 AND p.presente = true
           AND p.data_aula >= CURRENT_DATE - INTERVAL '30 days') as presencas_mes,
          (SELECT COUNT(*) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE h.membro_instrutor_id = $1 AND p.presente = true
           AND p.data_aula >= CURRENT_DATE - INTERVAL '7 days') as presencas_semana`,
        [targetInstrutorId]
      );

      academiasResult = await pool.query(
        `SELECT DISTINCT a.id, a.name, a.city
         FROM horarios_aulas h
         JOIN academias a ON h.academia_id = a.id
         WHERE h.membro_instrutor_id = $1 AND h.active = true AND a.active = true`,
        [targetInstrutorId]
      );
    } else {
      // Instrutor vê apenas suas estatísticas
      statsResult = await pool.query(
        `SELECT
          (SELECT COUNT(*) FROM horarios_aulas WHERE membro_instrutor_id = $1 AND active = true) as total_aulas,
          (SELECT COUNT(DISTINCT membro_id) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE h.membro_instrutor_id = $1) as total_alunos_distintos,
          (SELECT COUNT(*) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE h.membro_instrutor_id = $1 AND p.presente = true
           AND p.data_aula >= CURRENT_DATE - INTERVAL '30 days') as presencas_mes,
          (SELECT COUNT(*) FROM presencas p
           JOIN horarios_aulas h ON p.horario_aula_id = h.id
           WHERE h.membro_instrutor_id = $1 AND p.presente = true
           AND p.data_aula >= CURRENT_DATE - INTERVAL '7 days') as presencas_semana`,
        [session.membro!.id]
      );

      academiasResult = await pool.query(
        `SELECT DISTINCT a.id, a.name, a.city
         FROM horarios_aulas h
         JOIN academias a ON h.academia_id = a.id
         WHERE h.membro_instrutor_id = $1 AND h.active = true AND a.active = true`,
        [session.membro!.id]
      );

      perfilData = {
        id: session.membro!.id,
        nome: session.user.name,
        apelido: session.membro!.apelido,
        email: session.user.email,
        graduacao: session.membro!.graduacaoNome,
        corda: session.membro!.graduacaoCorda,
        corPrimaria: session.membro!.corPrimaria,
        corSecundaria: session.membro!.corSecundaria,
      };
    }

    const stats = statsResult.rows[0];

    return NextResponse.json({
      perfil: perfilData,
      estatisticas: {
        totalAulas: parseInt(stats.total_aulas) || 0,
        totalAlunosDistintos: parseInt(stats.total_alunos_distintos) || 0,
        presencasMes: parseInt(stats.presencas_mes) || 0,
        presencasSemana: parseInt(stats.presencas_semana) || 0,
      },
      academias: academiasResult.rows.map(row => ({
        id: row.id,
        nome: row.name,
        cidade: row.city,
      })),
      isAdminView: isAdminViewingAll,
      isAdminViewingSpecific,
      selectedInstrutorId: targetInstrutorId,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do instrutor:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}
