import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { pool } from '@/lib/db';
import { z } from 'zod';

const academiaSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  address: z.string().min(2).max(500).trim(),
  addressNumber: z.string().max(20).optional(),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().min(2).max(100).trim(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  active: z.boolean().optional().default(true),
});

// GET - Listar todas as academias (apenas admin)
export async function GET() {
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

    const result = await pool.query(
      `SELECT id, name, address, address_number, complement, neighborhood, city, state, zip_code, phone, email, description, active, created_at
       FROM academias
       ORDER BY name ASC`
    );

    return NextResponse.json({
      academias: result.rows.map(a => ({
        id: a.id,
        name: a.name,
        address: a.address,
        addressNumber: a.address_number,
        complement: a.complement,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        zipCode: a.zip_code,
        phone: a.phone,
        email: a.email,
        description: a.description,
        active: a.active,
        createdAt: a.created_at,
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

// POST - Criar nova academia
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
    const validatedData = academiaSchema.parse(body);

    const result = await pool.query(
      `INSERT INTO academias (name, address, address_number, complement, neighborhood, city, state, zip_code, phone, email, description, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, name, address, address_number, complement, neighborhood, city, state, zip_code, phone, email, description, active, created_at`,
      [
        validatedData.name,
        validatedData.address,
        validatedData.addressNumber || null,
        validatedData.complement || null,
        validatedData.neighborhood || null,
        validatedData.city,
        validatedData.state || null,
        validatedData.zipCode || null,
        validatedData.phone || null,
        validatedData.email || null,
        validatedData.description || null,
        validatedData.active,
      ]
    );

    const academia = result.rows[0];
    return NextResponse.json({
      message: 'Academia criada com sucesso',
      academia: {
        id: academia.id,
        name: academia.name,
        address: academia.address,
        addressNumber: academia.address_number,
        complement: academia.complement,
        neighborhood: academia.neighborhood,
        city: academia.city,
        state: academia.state,
        zipCode: academia.zip_code,
        phone: academia.phone,
        email: academia.email,
        description: academia.description,
        active: academia.active,
        createdAt: academia.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao criar academia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar academia
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
        { error: 'ID da academia é obrigatório' },
        { status: 400 }
      );
    }

    const validatedData = academiaSchema.parse(updateData);

    const result = await pool.query(
      `UPDATE academias
       SET name = $1, address = $2, address_number = $3, complement = $4, neighborhood = $5,
           city = $6, state = $7, zip_code = $8, phone = $9, email = $10, description = $11, active = $12
       WHERE id = $13
       RETURNING id, name, address, address_number, complement, neighborhood, city, state, zip_code, phone, email, description, active, created_at`,
      [
        validatedData.name,
        validatedData.address,
        validatedData.addressNumber || null,
        validatedData.complement || null,
        validatedData.neighborhood || null,
        validatedData.city,
        validatedData.state || null,
        validatedData.zipCode || null,
        validatedData.phone || null,
        validatedData.email || null,
        validatedData.description || null,
        validatedData.active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Academia não encontrada' },
        { status: 404 }
      );
    }

    const academia = result.rows[0];
    return NextResponse.json({
      message: 'Academia atualizada com sucesso',
      academia: {
        id: academia.id,
        name: academia.name,
        address: academia.address,
        addressNumber: academia.address_number,
        complement: academia.complement,
        neighborhood: academia.neighborhood,
        city: academia.city,
        state: academia.state,
        zipCode: academia.zip_code,
        phone: academia.phone,
        email: academia.email,
        description: academia.description,
        active: academia.active,
        createdAt: academia.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao atualizar academia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir academia
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
    const academiaId = searchParams.get('id');

    if (!academiaId) {
      return NextResponse.json(
        { error: 'ID da academia é obrigatório' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM academias WHERE id = $1 RETURNING id, name',
      [academiaId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Academia não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Academia excluída com sucesso',
      academia: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao excluir academia:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
