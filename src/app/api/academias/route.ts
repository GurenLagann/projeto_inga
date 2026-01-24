import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET - Listar academias ativas com horários (público)
export async function GET() {
  try {
    // Busca academias
    const result = await pool.query(
      `SELECT id, name, address, address_number, complement, neighborhood, city, state, zip_code, phone, email, description
       FROM academias
       WHERE active = true
       ORDER BY name ASC`
    );

    // Busca horários de cada academia
    const horariosResult = await pool.query(
      `SELECT h.academia_id, h.day_of_week, h.start_time, h.end_time, h.class_type
       FROM horarios_aulas h
       JOIN academias a ON h.academia_id = a.id
       WHERE h.active = true AND a.active = true
       ORDER BY h.day_of_week, h.start_time`
    );

    // Agrupa horários por academia
    const horariosPorAcademia: Record<number, { dayOfWeek: number; startTime: string; endTime: string; classType: string | null }[]> = {};
    for (const h of horariosResult.rows) {
      if (!horariosPorAcademia[h.academia_id]) {
        horariosPorAcademia[h.academia_id] = [];
      }
      horariosPorAcademia[h.academia_id].push({
        dayOfWeek: h.day_of_week,
        startTime: h.start_time,
        endTime: h.end_time,
        classType: h.class_type,
      });
    }

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Formata horários para exibição
    const formatarHorarios = (horarios: { dayOfWeek: number; startTime: string; endTime: string }[]) => {
      if (!horarios || horarios.length === 0) return 'Consulte-nos';

      // Agrupa por dia
      const porDia: Record<number, string[]> = {};
      for (const h of horarios) {
        if (!porDia[h.dayOfWeek]) {
          porDia[h.dayOfWeek] = [];
        }
        porDia[h.dayOfWeek].push(`${h.startTime.substring(0, 5)}-${h.endTime.substring(0, 5)}`);
      }

      // Formata string de horários
      const partes: string[] = [];
      for (const [dia, horas] of Object.entries(porDia)) {
        partes.push(`${diasSemana[parseInt(dia)]}: ${horas.join(', ')}`);
      }

      return partes.join(' | ');
    };

    return NextResponse.json({
      academias: result.rows.map(a => {
        // Monta endereço completo
        let endereco = a.address || '';
        if (a.address_number) endereco += `, ${a.address_number}`;
        if (a.complement) endereco += ` - ${a.complement}`;
        if (a.neighborhood) endereco += ` - ${a.neighborhood}`;
        if (a.city) endereco += `, ${a.city}`;
        if (a.state) endereco += ` - ${a.state}`;

        return {
          id: a.id,
          name: a.name,
          address: endereco,
          city: a.city,
          neighborhood: a.neighborhood,
          phone: a.phone || 'Não informado',
          email: a.email,
          description: a.description,
          schedule: formatarHorarios(horariosPorAcademia[a.id] || []),
          horarios: horariosPorAcademia[a.id] || [],
        };
      }),
    });
  } catch (error) {
    console.error('Erro ao listar academias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
