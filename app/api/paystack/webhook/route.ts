import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET || '')
    .update(body)
    .digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  const { data } = event

  switch (event.event) {
    case 'charge.success': {
      const userId = data.metadata?.userId
      if (!userId) break

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: 'pro',
          status: 'active',
          paystackCustomerId: data.customer?.customer_code,
          paystackSubCode: data.subscription_code || null
        },
        update: {
          plan: 'pro',
          status: 'active',
          paystackCustomerId: data.customer?.customer_code,
          paystackSubCode: data.subscription_code || null
        }
      })
      break
    }

    case 'subscription.disable':
    case 'invoice.payment_failed': {
      const customerCode = data.customer?.customer_code
      if (!customerCode) break

      const sub = await prisma.subscription.findFirst({
        where: { paystackCustomerId: customerCode }
      })

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'inactive', plan: 'free' }
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
