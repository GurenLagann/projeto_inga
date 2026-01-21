import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação com Zod
    const validatedData = registerSchema.parse(body);
    const { name, email, password, isExistingStudent, groupName, instructor, corda, cordaColor } = validatedData;

    // Verificar se o email já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha com custo 12 (mais seguro)
    const passwordHash = await bcrypt.hash(password, 12);

    // Inserir usuário com campos opcionais de aluno
    let result;
    if (isExistingStudent && groupName && instructor && corda) {
      result = await pool.query(
        `INSERT INTO usuarios (name, email, password_hash, group_name, instructor, corda, corda_color)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, group_name, instructor, corda, corda_color`,
        [name, email, passwordHash, groupName, instructor, corda, cordaColor || null]
      );
    } else {
      result = await pool.query(
        `INSERT INTO usuarios (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [name, email, passwordHash]
      );
    }

    const user = result.rows[0];

    return NextResponse.json(
      {
        message: 'Usuário cadastrado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          ...(isExistingStudent && {
            groupName: user.group_name,
            instructor: user.instructor,
            corda: user.corda,
            cordaColor: user.corda_color
          })
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

