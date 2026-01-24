import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionData } from '@/lib/session';

// POST - Check-in via QR Code
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.membro) {
      return NextResponse.json(
        { error: 'Você precisa ser um membro para fazer check-in' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 });
    }

    // Decodifica o token
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    const { horarioAulaId, dataAula, expiresAt } = tokenData;

    // Verifica se o token expirou
    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { error: 'QR Code expirado. Solicite um novo ao instrutor.' },
        { status: 400 }
      );
    }

    // Verifica se a aula existe
    const aulaResult = await pool.query(
      `SELECT h.*, a.name as academia_nome
       FROM horarios_aulas h
       JOIN academias a ON h.academia_id = a.id
       WHERE h.id = $1 AND h.active = true`,
      [horarioAulaId]
    );

    if (aulaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Aula não encontrada ou inativa' }, { status: 404 });
    }

    const aula = aulaResult.rows[0];

    // Verifica se é o dia correto da semana
    const dataAulaDate = new Date(dataAula);
    const diaSemanaAula = dataAulaDate.getUTCDay();

    if (diaSemanaAula !== aula.day_of_week) {
      return NextResponse.json(
        { error: 'Este QR Code não é para hoje' },
        { status: 400 }
      );
    }

    // Verifica se já existe check-in
    const existingResult = await pool.query(
      `SELECT id FROM presencas
       WHERE horario_aula_id = $1 AND membro_id = $2 AND data_aula = $3`,
      [horarioAulaId, session.membro.id, dataAula]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Check-in já registrado anteriormente',
        alreadyCheckedIn: true,
      });
    }

    // Registra a presença via QR code
    const result = await pool.query(
      `INSERT INTO presencas (horario_aula_id, membro_id, data_aula, presente, metodo_checkin)
       VALUES ($1, $2, $3, true, 'qrcode')
       RETURNING id`,
      [horarioAulaId, session.membro.id, dataAula]
    );

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return NextResponse.json({
      success: true,
      message: 'Check-in realizado com sucesso!',
      presencaId: result.rows[0].id,
      info: {
        academia: aula.academia_nome,
        horario: `${aula.start_time} - ${aula.end_time}`,
        diaSemana: diasSemana[aula.day_of_week],
        dataAula,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer check-in:', error);
    return NextResponse.json({ error: 'Erro ao fazer check-in' }, { status: 500 });
  }
}
