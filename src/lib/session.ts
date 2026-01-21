import { cookies } from 'next/headers';
import { pool } from './db';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias em segundos

interface SessionUser {
  id: number;
  name: string;
  email: string;
  corda: string | null;
  cordaColor: string | null;
  group: string | null;
  academy: string | null;
  instructor: string | null;
  joinedDate: string | null;
  baptizedDate: string | null;
  nextGraduation: string | null;
  admin: number;
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

// Obtém o usuário da sessão atual
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // Busca a sessão e o usuário
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.corda, u.corda_color, u.group_name,
              u.academy, u.instructor, u.joined_date, u.baptized_date, u.next_graduation, u.admin
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
      corda: user.corda,
      cordaColor: user.corda_color,
      group: user.group_name,
      academy: user.academy,
      instructor: user.instructor,
      joinedDate: user.joined_date,
      baptizedDate: user.baptized_date,
      nextGraduation: user.next_graduation,
      admin: user.admin,
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
