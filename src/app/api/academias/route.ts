import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Listar academias ativas (público)
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, city, neighborhood
       FROM academias
       WHERE active = true
       ORDER BY name ASC`
    );

    return NextResponse.json({
      academias: result.rows.map(a => ({
        id: a.id,
        name: a.name,
        city: a.city,
        neighborhood: a.neighborhood,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar academias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
