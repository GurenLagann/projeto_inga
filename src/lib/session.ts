import { cookies } from 'next/headers';
import { pool } from './db';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias em segundos

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  admin: number;
}

export interface SessionMembro {
  id: number;
  apelido: string | null;
  graduacaoId: number | null;
  graduacaoNome: string | null;
  graduacaoCorda: string | null;
  corPrimaria: string | null;
  corSecundaria: string | null;
  proximaGraduacaoId: number | null;
  proximaGraduacaoNome: string | null;
  mestreId: number | null;
  mestreNome: string | null;
  academiaId: number | null;
  academiaNome: string | null;
  dataEntrada: string | null;
  dataBatizado: string | null;
}

export interface SessionData {
  user: SessionUser;
  membro: SessionMembro | null;
}

// Gera um token de sessão seguro
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Cria uma sessão para o usuário
export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  // Armazena a sessão no banco de dados
  await pool.query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE SET user_id = $2, expires_at = $3`,
    [token, userId, expiresAt]
  );

  // Define o cookie HTTP-only
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

// Obtém apenas o usuário da sessão (para verificações rápidas)
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.admin
       FROM sessions s
       JOIN usuarios u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      admin: user.admin,
    };
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
}

// Obtém o usuário e dados de membro da sessão (dados completos)
export async function getSessionData(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // Busca usuário
    const userResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.admin
       FROM sessions s
       JOIN usuarios u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];
    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      admin: user.admin,
    };

    // Busca dados de membro (se existir)
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
       WHERE m.usuario_id = $1 AND m.active = true`,
      [user.id]
    );

    let sessionMembro: SessionMembro | null = null;
    if (membroResult.rows.length > 0) {
      const membro = membroResult.rows[0];
      sessionMembro = {
        id: membro.id,
        apelido: membro.apelido,
        graduacaoId: membro.graduacao_id,
        graduacaoNome: membro.graduacao_nome,
        graduacaoCorda: membro.graduacao_corda,
        corPrimaria: membro.cor_primaria,
        corSecundaria: membro.cor_secundaria,
        proximaGraduacaoId: membro.proxima_graduacao_id,
        proximaGraduacaoNome: membro.proxima_graduacao_nome,
        mestreId: membro.mestre_id,
        mestreNome: membro.mestre_nome,
        academiaId: membro.academia_id,
        academiaNome: membro.academia_nome,
        dataEntrada: membro.data_entrada,
        dataBatizado: membro.data_batizado,
      };
    }

    return {
      user: sessionUser,
      membro: sessionMembro,
    };
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
}

// Destrói a sessão atual
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Erro ao destruir sessão:', error);
  }
}

// Verifica se o usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return user !== null;
}
