import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { pool } from '@/lib/db';
import { z } from 'zod';

const horarioSchema = z.object({
  academiaId: z.number().int().positive(),
  membroInstrutorId: z.number().int().positive().optional().nullable(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido'),
  classType: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().optional().default(true),
});

// GET - Listar todos os horários (apenas admin)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const academiaId = searchParams.get('academiaId');

    let query = `
      SELECT h.id, h.academia_id, h.membro_instrutor_id, h.day_of_week, h.start_time, h.end_time,
             h.class_type, h.description, h.active, h.created_at,
             a.name as academia_name,
             m.apelido as instrutor_apelido,
             u.name as instrutor_nome
      FROM horarios_aulas h
      JOIN academias a ON h.academia_id = a.id
      LEFT JOIN membros m ON h.membro_instrutor_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
    `;
    const params: (string | number)[] = [];

    if (academiaId) {
      query += ' WHERE h.academia_id = $1';
      params.push(parseInt(academiaId));
    }

    query += ' ORDER BY h.academia_id, h.day_of_week, h.start_time';

    const result = await pool.query(query, params);

    return NextResponse.json({
      horarios: result.rows.map(h => ({
        id: h.id,
        academiaId: h.academia_id,
        academiaName: h.academia_name,
        membroInstrutorId: h.membro_instrutor_id,
        instrutorNome: h.instrutor_apelido || h.instrutor_nome,
        dayOfWeek: h.day_of_week,
        startTime: h.start_time,
        endTime: h.end_time,
        classType: h.class_type,
        description: h.description,
        active: h.active,
        createdAt: h.created_at,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar horários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo horário
export async function POST(request: NextRequest) {
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
    const validatedData = horarioSchema.parse(body);

    // Verificar se academia existe
    const academiaCheck = await pool.query(
      'SELECT id FROM academias WHERE id = $1',
      [validatedData.academiaId]
    );
    if (academiaCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Academia não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se instrutor (membro) existe (se fornecido)
    if (validatedData.membroInstrutorId) {
      const instrutorCheck = await pool.query(
        'SELECT id FROM membros WHERE id = $1 AND active = true',
        [validatedData.membroInstrutorId]
      );
      if (instrutorCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Instrutor não encontrado' },
          { status: 404 }
        );
      }
    }

    const result = await pool.query(
      `INSERT INTO horarios_aulas (academia_id, membro_instrutor_id, day_of_week, start_time, end_time, class_type, description, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, academia_id, membro_instrutor_id, day_of_week, start_time, end_time, class_type, description, active, created_at`,
      [
        validatedData.academiaId,
        validatedData.membroInstrutorId || null,
        validatedData.dayOfWeek,
        validatedData.startTime,
        validatedData.endTime,
        validatedData.classType || null,
        validatedData.description || null,
        validatedData.active,
      ]
    );

    const horario = result.rows[0];
    return NextResponse.json({
      message: 'Horário criado com sucesso',
      horario: {
        id: horario.id,
        academiaId: horario.academia_id,
        membroInstrutorId: horario.membro_instrutor_id,
        dayOfWeek: horario.day_of_week,
        startTime: horario.start_time,
        endTime: horario.end_time,
        classType: horario.class_type,
        description: horario.description,
        active: horario.active,
        createdAt: horario.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar horário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar horário
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do horário é obrigatório' },
        { status: 400 }
      );
    }

    const validatedData = horarioSchema.parse(updateData);

    // Verificar se academia existe
    const academiaCheck = await pool.query(
      'SELECT id FROM academias WHERE id = $1',
      [validatedData.academiaId]
    );
    if (academiaCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Academia não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se instrutor existe (se fornecido)
    if (validatedData.instructorId) {
      const instructorCheck = await pool.query(
        'SELECT id FROM usuarios WHERE id = $1',
        [validatedData.instructorId]
      );
      if (instructorCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Instrutor não encontrado' },
          { status: 404 }
        );
      }
    }

    const result = await pool.query(
      `UPDATE horarios_aulas
       SET academia_id = $1, instructor_id = $2, day_of_week = $3, start_time = $4,
           end_time = $5, class_type = $6, description = $7, active = $8
       WHERE id = $9
       RETURNING id, academia_id, instructor_id, day_of_week, start_time, end_time, class_type, description, active, created_at`,
      [
        validatedData.academiaId,
        validatedData.instructorId || null,
        validatedData.dayOfWeek,
        validatedData.startTime,
        validatedData.endTime,
        validatedData.classType || null,
        validatedData.description || null,
        validatedData.active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Horário não encontrado' },
        { status: 404 }
      );
    }

    const horario = result.rows[0];
    return NextResponse.json({
      message: 'Horário atualizado com sucesso',
      horario: {
        id: horario.id,
        academiaId: horario.academia_id,
        instructorId: horario.instructor_id,
        dayOfWeek: horario.day_of_week,
        startTime: horario.start_time,
        endTime: horario.end_time,
        classType: horario.class_type,
        description: horario.description,
        active: horario.active,
        createdAt: horario.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar horário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir horário
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
    const horarioId = searchParams.get('id');

    if (!horarioId) {
      return NextResponse.json(
        { error: 'ID do horário é obrigatório' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM horarios_aulas WHERE id = $1 RETURNING id',
      [horarioId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Horário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Horário excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir horário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
