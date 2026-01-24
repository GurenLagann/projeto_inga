import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Listar todas as graduações (público)
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nome, corda, cor_primaria, cor_secundaria, ordem, tipo, descricao
       FROM graduacoes
       ORDER BY ordem ASC`
    );

    return NextResponse.json({
      graduacoes: result.rows.map(g => ({
        id: g.id,
        nome: g.nome,
        corda: g.corda,
        corPrimaria: g.cor_primaria,
        corSecundaria: g.cor_secundaria,
        ordem: g.ordem,
        tipo: g.tipo,
        descricao: g.descricao,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar graduações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
