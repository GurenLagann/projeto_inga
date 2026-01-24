import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionData } from '@/lib/session';

// Formata data para iCal (YYYYMMDD)
function formatDate(date: string): string {
  return date.replace(/-/g, '');
}

// Formata data/hora para iCal (YYYYMMDDTHHMMSS)
function formatDateTime(date: string, time: string | null): string {
  const dateFormatted = date.replace(/-/g, '');
  if (time) {
    const timeFormatted = time.replace(/:/g, '').substring(0, 6);
    return `${dateFormatted}T${timeFormatted}`;
  }
  return dateFormatted;
}

// Escapa texto para iCal
function escapeText(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// GET - Exportar calendário em formato iCal
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const incluirAulas = searchParams.get('aulas') !== 'false';
    const incluirEventos = searchParams.get('eventos') !== 'false';
    const academiaId = searchParams.get('academiaId');
    const meses = parseInt(searchParams.get('meses') || '3'); // Próximos N meses

    const events: string[] = [];

    // Busca eventos
    if (incluirEventos) {
      let eventosQuery = `
        SELECT
          id, titulo, descricao, data_inicio, data_fim,
          hora_inicio, hora_fim, local, tipo
        FROM eventos
        WHERE active = true AND data_inicio >= CURRENT_DATE
          AND data_inicio <= CURRENT_DATE + INTERVAL '${meses} months'
      `;
      const eventosParams: number[] = [];

      if (academiaId) {
        eventosQuery += ' AND (academia_id = $1 OR academia_id IS NULL)';
        eventosParams.push(parseInt(academiaId));
      }

      const eventosResult = await pool.query(eventosQuery, eventosParams);

      for (const evento of eventosResult.rows) {
        const uid = `evento-${evento.id}@inga-capoeira.com`;
        const dtStart = formatDateTime(evento.data_inicio, evento.hora_inicio);
        const dtEnd = evento.data_fim
          ? formatDateTime(evento.data_fim, evento.hora_fim || evento.hora_inicio)
          : formatDateTime(evento.data_inicio, evento.hora_fim);

        events.push(`BEGIN:VEVENT
UID:${uid}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${escapeText(evento.titulo)}
DESCRIPTION:${escapeText(evento.descricao)}
LOCATION:${escapeText(evento.local)}
CATEGORIES:${evento.tipo.toUpperCase()}
END:VEVENT`);
      }
    }

    // Busca aulas regulares
    if (incluirAulas) {
      let aulasQuery = `
        SELECT
          h.id, h.day_of_week, h.start_time, h.end_time,
          h.class_type, h.description,
          a.name as academia_nome, a.address
        FROM horarios_aulas h
        JOIN academias a ON h.academia_id = a.id
        WHERE h.active = true AND a.active = true
      `;
      const aulasParams: number[] = [];

      if (academiaId) {
        aulasQuery += ' AND h.academia_id = $1';
        aulasParams.push(parseInt(academiaId));
      }

      const aulasResult = await pool.query(aulasQuery, aulasParams);
      const diasSemana = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

      // Gera eventos recorrentes para aulas
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + meses);

      for (const aula of aulasResult.rows) {
        // Encontra a próxima ocorrência do dia da semana
        const nextOccurrence = new Date(today);
        while (nextOccurrence.getDay() !== aula.day_of_week) {
          nextOccurrence.setDate(nextOccurrence.getDate() + 1);
        }

        const uid = `aula-${aula.id}@inga-capoeira.com`;
        const dtStartDate = nextOccurrence.toISOString().split('T')[0];
        const dtStart = formatDateTime(dtStartDate, aula.start_time);
        const dtEnd = formatDateTime(dtStartDate, aula.end_time);
        const rruleUntil = formatDate(endDate.toISOString().split('T')[0]);

        const titulo = `Aula de Capoeira - ${aula.academia_nome}`;
        const descricao = aula.class_type || aula.description || 'Aula regular de Capoeira';

        events.push(`BEGIN:VEVENT
UID:${uid}
DTSTART:${dtStart}
DTEND:${dtEnd}
RRULE:FREQ=WEEKLY;BYDAY=${diasSemana[aula.day_of_week]};UNTIL=${rruleUntil}
SUMMARY:${escapeText(titulo)}
DESCRIPTION:${escapeText(descricao)}
LOCATION:${escapeText(aula.academia_nome + (aula.address ? ', ' + aula.address : ''))}
CATEGORIES:AULA
END:VEVENT`);
      }
    }

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Inga Capoeira//Calendario//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Grupo Inga Capoeira
X-WR-TIMEZONE:America/Sao_Paulo
${events.join('\n')}
END:VCALENDAR`;

    return new NextResponse(calendar, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="inga-capoeira.ics"',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar iCal:', error);
    return NextResponse.json({ error: 'Erro ao gerar calendário' }, { status: 500 });
  }
}
