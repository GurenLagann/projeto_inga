import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// POST - Registrar interesse de visitante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telefone, email, experienciaCapoeira, academiaInteresse, observacoes } = body;

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Insere o interessado no banco
    const result = await pool.query(
      `INSERT INTO interessados (nome, telefone, email, experiencia_capoeira, academia_interesse_id, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [nome, telefone || null, email || null, experienciaCapoeira || false, academiaInteresse || null, observacoes || null]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Interesse registrado com sucesso! Entraremos em contato em breve.',
    });
  } catch (error) {
    console.error('Erro ao registrar interesse:', error);
    return NextResponse.json({ error: 'Erro ao registrar interesse' }, { status: 500 });
  }
}

// GET - Listar interessados (apenas admin)
export async function GET(request: NextRequest) {
  try {
    // Por enquanto, retorna os horários públicos para o modal
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');

    if (tipo === 'horarios') {
      // Retorna horários de aula agrupados por academia
      const result = await pool.query(`
        SELECT
          a.id as academia_id,
          a.name as academia_nome,
          a.address as academia_endereco,
          a.neighborhood as academia_bairro,
          a.city as academia_cidade,
          a.phone as academia_telefone,
          h.id as horario_id,
          h.day_of_week,
          h.start_time,
          h.end_time,
          h.class_type
        FROM academias a
        LEFT JOIN horarios_aulas h ON a.id = h.academia_id AND h.active = true
        WHERE a.active = true
        ORDER BY a.name, h.day_of_week, h.start_time
      `);

      // Agrupa por academia
      const academiasMap = new Map();
      for (const row of result.rows) {
        if (!academiasMap.has(row.academia_id)) {
          academiasMap.set(row.academia_id, {
            id: row.academia_id,
            nome: row.academia_nome,
            endereco: row.academia_endereco,
            bairro: row.academia_bairro,
            cidade: row.academia_cidade,
            telefone: row.academia_telefone,
            horarios: [],
          });
        }
        if (row.horario_id) {
          academiasMap.get(row.academia_id).horarios.push({
            id: row.horario_id,
            diaSemana: row.day_of_week,
            horaInicio: row.start_time,
            horaFim: row.end_time,
            tipoAula: row.class_type,
          });
        }
      }

      return NextResponse.json({
        academias: Array.from(academiasMap.values()),
      });
    }

    return NextResponse.json({ error: 'Tipo não especificado' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
