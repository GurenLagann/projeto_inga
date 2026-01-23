import { NextRequest, NextResponse } from 'next/server';
import { getSessionData } from '@/lib/session';
import { pool } from '@/lib/db';
import { z } from 'zod';

// Schema de validação para atualização de perfil do usuário
const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().max(30).optional().nullable(),
});

// Schema de validação para atualização de membro
const updateMembroSchema = z.object({
  apelido: z.string().max(100).optional().nullable(),
  graduacaoId: z.number().int().positive().optional().nullable(),
  academiaId: z.number().int().positive().optional().nullable(),
});

export async function GET() {
  try {
    const sessionData = await getSessionData();

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: sessionData.user,
      membro: sessionData.membro,
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
    const sessionData = await getSessionData();

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para acessar.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { user: userUpdate, membro: membroUpdate } = body;

    let updatedUser = sessionData.user;
    let updatedMembro = sessionData.membro;

    // Atualizar dados do usuário
    if (userUpdate) {
      const validatedUser = updateUserSchema.parse(userUpdate);

      const updates: string[] = [];
      const values: (string | null)[] = [];
      let paramIndex = 1;

      if (validatedUser.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(validatedUser.name);
      }
      if (validatedUser.phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(validatedUser.phone);
      }

      if (updates.length > 0) {
        values.push(sessionData.user.id.toString());
        const result = await pool.query(
          `UPDATE usuarios SET ${updates.join(', ')}, updated_at = NOW()
           WHERE id = $${paramIndex}
           RETURNING id, name, email, phone, admin`,
          values
        );
        const u = result.rows[0];
        updatedUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          admin: u.admin,
        };
      }
    }

    // Atualizar dados do membro (se existir)
    if (membroUpdate && sessionData.membro) {
      const validatedMembro = updateMembroSchema.parse(membroUpdate);

      const updates: string[] = [];
      const values: (string | number | null)[] = [];
      let paramIndex = 1;

      if (validatedMembro.apelido !== undefined) {
        updates.push(`apelido = $${paramIndex++}`);
        values.push(validatedMembro.apelido);
      }
      if (validatedMembro.graduacaoId !== undefined) {
        updates.push(`graduacao_id = $${paramIndex++}`);
        values.push(validatedMembro.graduacaoId);
      }
      if (validatedMembro.academiaId !== undefined) {
        updates.push(`academia_id = $${paramIndex++}`);
        values.push(validatedMembro.academiaId);
      }

      if (updates.length > 0) {
        values.push(sessionData.membro.id);
        await pool.query(
          `UPDATE membros SET ${updates.join(', ')}, updated_at = NOW()
           WHERE id = $${paramIndex}`,
          values
        );

        // Buscar dados atualizados do membro
        const membroResult = await pool.query(
          `SELECT
            m.id, m.apelido, m.data_entrada, m.data_batizado,
            m.graduacao_id, g.nome as graduacao_nome, g.corda as graduacao_corda,
            g.cor_primaria, g.cor_secundaria,
            m.proxima_graduacao_id, pg.nome as proxima_graduacao_nome,
            m.mestre_id, um.name as mestre_nome,
            m.academia_id, a.name as academia_nome
           FROM membros m
           LEFT JOIN graduacoes g ON m.graduacao_id = g.id
           LEFT JOIN graduacoes pg ON m.proxima_graduacao_id = pg.id
           LEFT JOIN membros mm ON m.mestre_id = mm.id
           LEFT JOIN usuarios um ON mm.usuario_id = um.id
           LEFT JOIN academias a ON m.academia_id = a.id
           WHERE m.id = $1`,
          [sessionData.membro.id]
        );

        if (membroResult.rows.length > 0) {
          const m = membroResult.rows[0];
          updatedMembro = {
            id: m.id,
            apelido: m.apelido,
            graduacaoId: m.graduacao_id,
            graduacaoNome: m.graduacao_nome,
            graduacaoCorda: m.graduacao_corda,
            corPrimaria: m.cor_primaria,
            corSecundaria: m.cor_secundaria,
            proximaGraduacaoId: m.proxima_graduacao_id,
            proximaGraduacaoNome: m.proxima_graduacao_nome,
            mestreId: m.mestre_id,
            mestreNome: m.mestre_nome,
            academiaId: m.academia_id,
            academiaNome: m.academia_nome,
            dataEntrada: m.data_entrada,
            dataBatizado: m.data_batizado,
          };
        }
      }
    }

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser,
      membro: updatedMembro,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
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
