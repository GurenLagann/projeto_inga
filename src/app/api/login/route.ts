import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validations';
import { createSession } from '@/lib/session';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação com Zod
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Buscar usuário (sem SELECT *)
    const result = await pool.query(
      `SELECT id, name, email, password_hash, corda, corda_color, group_name,
              academy, instructor, joined_date, baptized_date, next_graduation
       FROM usuarios WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Criar sessão com cookie HTTP-only
    await createSession(user.id);

    // Retornar dados do usuário (sem a senha)
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        corda: user.corda,
        cordaColor: user.corda_color,
        group: user.group_name,
        academy: user.academy,
        instructor: user.instructor,
        joinedDate: user.joined_date,
        baptizedDate: user.baptized_date,
        nextGraduation: user.next_graduation,
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

    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

