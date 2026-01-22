import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255).trim(),
  email: z.string().email('Email inválido').max(255).toLowerCase().trim(),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(128),
  phone: z.string().max(30).optional(),
  // Campos opcionais para criar membro
  isMembro: z.boolean().optional().default(false),
  apelido: z.string().max(100).optional(),
  graduacaoId: z.number().int().positive().optional(),
  academiaId: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Verificar se o email já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [validatedData.email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Criar usuário
    const userResult = await pool.query(
      `INSERT INTO usuarios (name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone`,
      [validatedData.name, validatedData.email, passwordHash, validatedData.phone || null]
    );

    const user = userResult.rows[0];

    // Se for membro, criar registro na tabela de membros
    let membro = null;
    if (validatedData.isMembro) {
      const membroResult = await pool.query(
        `INSERT INTO membros (usuario_id, apelido, graduacao_id, academia_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, apelido, graduacao_id, academia_id`,
        [
          user.id,
          validatedData.apelido || null,
          validatedData.graduacaoId || null,
          validatedData.academiaId || null,
        ]
      );
      membro = membroResult.rows[0];

      // Criar relacionamento usuario_membro
      await pool.query(
        `INSERT INTO usuarios_membros (usuario_id, membro_id, tipo_relacao)
         VALUES ($1, $2, 'proprio')`,
        [user.id, membro.id]
      );
    }

    return NextResponse.json({
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      membro: membro ? {
        id: membro.id,
        apelido: membro.apelido,
      } : null,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao registrar:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
