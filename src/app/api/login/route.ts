import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação com Zod
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Buscar usuário
    const result = await pool.query(
      `SELECT id, name, email, password_hash, phone, admin
       FROM usuarios WHERE email = $1`,
      [email.toLowerCase()]
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

    // Buscar dados de membro (se existir)
    const membroResult = await pool.query(
      `SELECT
        m.id, m.apelido, m.data_entrada, m.data_batizado,
        m.graduacao_id, g.nome as graduacao_nome, g.corda as graduacao_corda,
        g.cor_primaria, g.cor_secundaria,
        m.proxima_graduacao_id, pg.nome as proxima_graduacao_nome,
        m.academia_id, a.name as academia_nome
       FROM membros m
       LEFT JOIN graduacoes g ON m.graduacao_id = g.id
       LEFT JOIN graduacoes pg ON m.proxima_graduacao_id = pg.id
       LEFT JOIN academias a ON m.academia_id = a.id
       WHERE m.usuario_id = $1 AND m.active = true`,
      [user.id]
    );

    let membro = null;
    if (membroResult.rows.length > 0) {
      const m = membroResult.rows[0];
      membro = {
        id: m.id,
        apelido: m.apelido,
        graduacaoId: m.graduacao_id,
        graduacaoNome: m.graduacao_nome,
        graduacaoCorda: m.graduacao_corda,
        corPrimaria: m.cor_primaria,
        corSecundaria: m.cor_secundaria,
        proximaGraduacaoId: m.proxima_graduacao_id,
        proximaGraduacaoNome: m.proxima_graduacao_nome,
        academiaId: m.academia_id,
        academiaNome: m.academia_nome,
        dataEntrada: m.data_entrada,
        dataBatizado: m.data_batizado,
      };
    }

    // Retornar dados do usuário (sem a senha)
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        admin: user.admin,
      },
      membro,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
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
