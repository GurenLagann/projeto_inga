import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import * as XLSX from 'xlsx';

// GET - Relatório de presenças
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.admin !== 1) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const academiaId = searchParams.get('academiaId');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const format = searchParams.get('format') || 'json';

    // Relatório por membro
    let query = `
      SELECT
        m.id as membro_id,
        u.name as nome,
        m.apelido,
        g.nome as graduacao,
        a.name as academia,
        COUNT(CASE WHEN p.presente = true THEN 1 END) as presencas_confirmadas,
        COUNT(CASE WHEN p.presente = false THEN 1 END) as faltas,
        COUNT(p.id) as total_registros
      FROM membros m
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN graduacoes g ON m.graduacao_id = g.id
      LEFT JOIN academias a ON m.academia_id = a.id
      LEFT JOIN presencas p ON p.membro_id = m.id
      LEFT JOIN horarios_aulas h ON p.horario_aula_id = h.id
      WHERE m.active = true
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (academiaId) {
      query += ` AND (m.academia_id = $${paramIndex} OR h.academia_id = $${paramIndex})`;
      params.push(parseInt(academiaId));
      paramIndex++;
    }

    if (dataInicio) {
      query += ` AND (p.data_aula >= $${paramIndex} OR p.data_aula IS NULL)`;
      params.push(dataInicio);
      paramIndex++;
    }

    if (dataFim) {
      query += ` AND (p.data_aula <= $${paramIndex} OR p.data_aula IS NULL)`;
      params.push(dataFim);
      paramIndex++;
    }

    query += `
      GROUP BY m.id, u.name, m.apelido, g.nome, a.name
      ORDER BY u.name
    `;

    const result = await pool.query(query, params);

    const relatorio = result.rows.map(row => {
      const total = parseInt(row.total_registros) || 0;
      const presencas = parseInt(row.presencas_confirmadas) || 0;
      const percentual = total > 0 ? Math.round((presencas / total) * 100) : 0;

      return {
        membroId: row.membro_id,
        nome: row.nome,
        apelido: row.apelido,
        graduacao: row.graduacao,
        academia: row.academia,
        totalPresencas: total,
        presencasConfirmadas: presencas,
        faltas: parseInt(row.faltas) || 0,
        percentualPresenca: percentual,
      };
    });

    if (format === 'json') {
      return NextResponse.json({ relatorio });
    }

    // Prepara dados para exportação
    const exportData = relatorio.map(r => ({
      'Nome': r.nome,
      'Apelido': r.apelido || '-',
      'Graduação': r.graduacao || '-',
      'Academia': r.academia || '-',
      'Total Registros': r.totalPresencas,
      'Presenças': r.presencasConfirmadas,
      'Faltas': r.faltas,
      '% Presença': `${r.percentualPresenca}%`,
    }));

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      ws['!cols'] = [
        { wch: 25 }, // Nome
        { wch: 15 }, // Apelido
        { wch: 15 }, // Graduação
        { wch: 20 }, // Academia
        { wch: 12 }, // Total
        { wch: 10 }, // Presenças
        { wch: 8 },  // Faltas
        { wch: 10 }, // %
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Presenças');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="presencas-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(';')];

      for (const row of exportData) {
        const values = headers.map(h => {
          const val = row[h as keyof typeof row];
          if (typeof val === 'string' && (val.includes(';') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvRows.push(values.join(';'));
      }

      return new NextResponse(csvRows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="presencas-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ relatorio });
  } catch (error) {
    console.error('Erro ao gerar relatório de presenças:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}
