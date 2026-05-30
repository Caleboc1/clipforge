import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-secret-in-production-min-32-chars'
)

export interface SessionPayload {
  userId: string
  email: string
  isAdmin: boolean
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { subscription: true }
  })
}

export function setAuthCookie(response: Response, token: string) {
  response.headers.set(
    'Set-Cookie',
    `auth-token=${token}; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; Path=/${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`
  )
}
