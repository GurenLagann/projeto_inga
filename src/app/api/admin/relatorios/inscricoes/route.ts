import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import * as XLSX from 'xlsx';

// GET - Exportar lista de inscrições
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.admin !== 1) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventoId = searchParams.get('eventoId');
    const format = searchParams.get('format') || 'json'; // json, excel, csv

    let query = `
      SELECT
        ie.id,
        e.titulo as evento_titulo,
        e.data_inicio as evento_data,
        COALESCE(u.name, ie.nome_externo) as nome,
        COALESCE(u.email, ie.email_externo) as email,
        COALESCE(u.phone, ie.telefone_externo) as telefone,
        m.apelido,
        g.nome as graduacao,
        ie.status,
        ie.data_inscricao
      FROM inscricoes_eventos ie
      JOIN eventos e ON ie.evento_id = e.id
      LEFT JOIN membros m ON ie.membro_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id OR ie.usuario_id = u.id
      LEFT JOIN graduacoes g ON m.graduacao_id = g.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (eventoId) {
      query += ` AND ie.evento_id = $${paramIndex}`;
      params.push(parseInt(eventoId));
      paramIndex++;
    }

    query += ' ORDER BY ie.data_inscricao DESC';

    const result = await pool.query(query, params);

    const inscricoes = result.rows.map(row => ({
      id: row.id,
      eventoTitulo: row.evento_titulo,
      eventoData: row.evento_data,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      apelido: row.apelido,
      graduacao: row.graduacao,
      status: row.status,
      dataInscricao: row.data_inscricao,
    }));

    if (format === 'json') {
      return NextResponse.json({ inscricoes });
    }

    // Prepara dados para exportação
    const exportData = inscricoes.map(i => ({
      'Evento': i.eventoTitulo,
      'Data Evento': new Date(i.eventoData).toLocaleDateString('pt-BR'),
      'Nome': i.nome,
      'Apelido': i.apelido || '-',
      'Email': i.email,
      'Telefone': i.telefone || '-',
      'Graduação': i.graduacao || '-',
      'Status': i.status,
      'Data Inscrição': new Date(i.dataInscricao).toLocaleDateString('pt-BR'),
    }));

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Ajusta largura das colunas
      ws['!cols'] = [
        { wch: 30 }, // Evento
        { wch: 12 }, // Data Evento
        { wch: 25 }, // Nome
        { wch: 15 }, // Apelido
        { wch: 30 }, // Email
        { wch: 15 }, // Telefone
        { wch: 15 }, // Graduação
        { wch: 12 }, // Status
        { wch: 15 }, // Data Inscrição
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Inscrições');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="inscricoes-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(';')];

      for (const row of exportData) {
        const values = headers.map(h => {
          const val = row[h as keyof typeof row];
          // Escapa aspas e adiciona aspas se contém separador
          if (typeof val === 'string' && (val.includes(';') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvRows.push(values.join(';'));
      }

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscricoes-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ inscricoes });
  } catch (error) {
    console.error('Erro ao exportar inscrições:', error);
    return NextResponse.json({ error: 'Erro ao exportar inscrições' }, { status: 500 });
  }
}
