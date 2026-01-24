import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionData } from '@/lib/session';

// GET - Itens do calendário (eventos + aulas)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mes = searchParams.get('mes'); // formato: YYYY-MM
    const academiaId = searchParams.get('academiaId');

    const items = [];

    // Busca eventos
    let eventosQuery = `
      SELECT
        id,
        titulo,
        descricao,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        local,
        tipo,
        status
      FROM eventos
      WHERE active = true
    `;
    const eventosParams: (string | number)[] = [];
    let eventosParamIndex = 1;

    if (mes) {
      const [ano, mesNum] = mes.split('-');
      const dataInicio = `${ano}-${mesNum}-01`;
      const dataFim = new Date(parseInt(ano), parseInt(mesNum), 0).toISOString().split('T')[0];
      eventosQuery += ` AND data_inicio <= $${eventosParamIndex} AND (data_fim >= $${eventosParamIndex + 1} OR (data_fim IS NULL AND data_inicio >= $${eventosParamIndex + 1}))`;
      eventosParams.push(dataFim, dataInicio);
      eventosParamIndex += 2;
    }

    if (academiaId) {
      eventosQuery += ` AND (academia_id = $${eventosParamIndex} OR academia_id IS NULL)`;
      eventosParams.push(parseInt(academiaId));
    }

    eventosQuery += ' ORDER BY data_inicio';

    const eventosResult = await pool.query(eventosQuery, eventosParams);

    const tipoEventoCores: Record<string, string> = {
      roda: '#22C55E',      // Verde
      batizado: '#F59E0B',  // Amarelo
      workshop: '#3B82F6',  // Azul
      treino: '#8B5CF6',    // Roxo
      geral: '#6B7280',     // Cinza
    };

    for (const evento of eventosResult.rows) {
      items.push({
        id: evento.id,
        tipo: 'evento',
        titulo: evento.titulo,
        descricao: evento.descricao,
        dataInicio: evento.data_inicio,
        dataFim: evento.data_fim,
        horaInicio: evento.hora_inicio,
        horaFim: evento.hora_fim,
        local: evento.local,
        cor: tipoEventoCores[evento.tipo] || tipoEventoCores.geral,
        status: evento.status,
      });
    }

    // Busca aulas regulares da semana (se um mês específico for solicitado)
    if (mes) {
      let aulasQuery = `
        SELECT
          h.id,
          h.day_of_week,
          h.start_time,
          h.end_time,
          h.class_type,
          h.description,
          a.id as academia_id,
          a.name as academia_nome
        FROM horarios_aulas h
        JOIN academias a ON h.academia_id = a.id
        WHERE h.active = true AND a.active = true
      `;
      const aulasParams: (number)[] = [];

      if (academiaId) {
        aulasQuery += ' AND h.academia_id = $1';
        aulasParams.push(parseInt(academiaId));
      }

      aulasQuery += ' ORDER BY h.day_of_week, h.start_time';

      const aulasResult = await pool.query(aulasQuery, aulasParams);
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

      // Gera as ocorrências de aulas para o mês
      const [ano, mesNum] = mes.split('-');
      const firstDay = new Date(parseInt(ano), parseInt(mesNum) - 1, 1);
      const lastDay = new Date(parseInt(ano), parseInt(mesNum), 0);

      for (const aula of aulasResult.rows) {
        // Encontra todas as datas do mês que correspondem ao dia da semana
        const currentDay = new Date(firstDay);
        while (currentDay <= lastDay) {
          if (currentDay.getDay() === aula.day_of_week) {
            const dataFormatada = currentDay.toISOString().split('T')[0];
            items.push({
              id: aula.id * 1000 + currentDay.getDate(), // ID único para cada ocorrência
              tipo: 'aula',
              titulo: `Aula - ${aula.academia_nome}`,
              descricao: aula.class_type || aula.description || `Aula de Capoeira`,
              dataInicio: dataFormatada,
              dataFim: null,
              horaInicio: aula.start_time,
              horaFim: aula.end_time,
              local: aula.academia_nome,
              cor: '#DC2626', // Vermelho para aulas
              diaSemana: diasSemana[aula.day_of_week],
              horarioAulaId: aula.id,
            });
          }
          currentDay.setDate(currentDay.getDate() + 1);
        }
      }
    }

    // Ordena por data
    items.sort((a, b) => {
      const dateA = new Date(`${a.dataInicio}T${a.horaInicio || '00:00:00'}`);
      const dateB = new Date(`${b.dataInicio}T${b.horaInicio || '00:00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Erro ao buscar calendário:', error);
    return NextResponse.json({ error: 'Erro ao buscar calendário' }, { status: 500 });
  }
}
