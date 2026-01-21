import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { pool } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para atualização de perfil
const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  corda: z.string().max(100).optional().nullable(),
  cordaColor: z.string().max(7).optional().nullable(),
  groupName: z.string().max(255).optional().nullable(),
  academy: z.string().max(255).optional().nullable(),
  instructor: z.string().max(255).optional().nullable(),
  joinedDate: z.string().optional().nullable(),
  baptizedDate: z.string().optional().nullable(),
  nextGraduation: z.string().max(100).optional().nullable(),
});

export async function GET() {
  try {
    // Verificar autenticação via sessão (não aceita mais ID via query)
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar.' },
        { status: 401 }
      );
    }

    // Retornar dados do usuário autenticado
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      corda: user.corda,
      cordaColor: user.cordaColor,
      group: user.group,
      academy: user.academy,
      instructor: user.instructor,
      joinedDate: user.joinedDate,
      baptizedDate: user.baptizedDate,
      nextGraduation: user.nextGraduation,
    });
  } catch (error) {
    console.error('Erro ao buscar informações do aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Construir query dinâmica apenas com campos fornecidos
    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (validatedData.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(validatedData.name);
    }
    if (validatedData.corda !== undefined) {
      updates.push(`corda = $${paramIndex++}`);
      values.push(validatedData.corda);
    }
    if (validatedData.cordaColor !== undefined) {
      updates.push(`corda_color = $${paramIndex++}`);
      values.push(validatedData.cordaColor);
    }
    if (validatedData.groupName !== undefined) {
      updates.push(`group_name = $${paramIndex++}`);
      values.push(validatedData.groupName);
    }
    if (validatedData.academy !== undefined) {
      updates.push(`academy = $${paramIndex++}`);
      values.push(validatedData.academy);
    }
    if (validatedData.instructor !== undefined) {
      updates.push(`instructor = $${paramIndex++}`);
      values.push(validatedData.instructor);
    }
    if (validatedData.joinedDate !== undefined) {
      updates.push(`joined_date = $${paramIndex++}`);
      values.push(validatedData.joinedDate);
    }
    if (validatedData.baptizedDate !== undefined) {
      updates.push(`baptized_date = $${paramIndex++}`);
      values.push(validatedData.baptizedDate);
    }
    if (validatedData.nextGraduation !== undefined) {
      updates.push(`next_graduation = $${paramIndex++}`);
      values.push(validatedData.nextGraduation);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    // Adicionar ID do usuário como último parâmetro
    values.push(user.id.toString());

    const result = await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, name, email, corda, corda_color, group_name, academy,
                 instructor, joined_date, baptized_date, next_graduation`,
      values
    );

    const updatedUser = result.rows[0];

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        corda: updatedUser.corda,
        cordaColor: updatedUser.corda_color,
        group: updatedUser.group_name,
        academy: updatedUser.academy,
        instructor: updatedUser.instructor,
        joinedDate: updatedUser.joined_date,
        baptizedDate: updatedUser.baptized_date,
        nextGraduation: updatedUser.next_graduation,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

