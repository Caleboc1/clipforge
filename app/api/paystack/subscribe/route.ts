import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { plan: selectedPlan = 'pro' } = await req.json().catch(() => ({}))
    const isPlus = selectedPlan === 'plus'

    const body = JSON.stringify({
      email: user.email,
      amount: isPlus ? 2000000 : 500000, // ₦20,000 or ₦5,000 in kobo
      plan: isPlus ? process.env.PAYSTACK_PLUS_PLAN_CODE : process.env.PAYSTACK_PLAN_CODE,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
      metadata: { userId: user.id, plan: isPlus ? 'plus' : 'pro', cancel_action: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard` }
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
