import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = JSON.stringify({
      email: user.email,
      amount: 500000, // ₦5,000 in kobo
      plan: process.env.PAYSTACK_PLAN_CODE,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
      metadata: { userId: user.id, plan: 'pro', cancel_action: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard` }
    })

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Payment init failed' }, { status: 400 })
    }

    return NextResponse.json({ authorizationUrl: data.data.authorization_url })
  } catch (err) {
    console.error('Paystack subscribe error:', err)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
