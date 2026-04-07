import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SERVICE_KEY = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' },
    })
  }

  try {
    const secret = req.headers.get('x-webhook-secret')
    if (secret !== SERVICE_KEY) {
      console.error('[payment-webhook] Invalid secret')
      return json({ matched: false, error: 'Unauthorized' }, 401)
    }

    const body = await req.json()
    const { transaction_code, amount, sender_name } = body

    if (!transaction_code || !amount) {
      return json({ matched: false, error: 'Missing fields' }, 400)
    }

    // Parse B2-{prefix8}
    const match = transaction_code.match(/^B2-([a-z0-9]{8})/i)
    if (!match) {
      console.log('[payment-webhook] No B2- prefix found in:', transaction_code)
      return json({ matched: false })
    }
    const idPrefix = match[1].toLowerCase()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Find user by id prefix
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('id', `${idPrefix}%`)
      .limit(1)

    if (userError || !users || users.length === 0) {
      console.log('[payment-webhook] No user found for prefix:', idPrefix)
      return json({ matched: false })
    }
    const user = users[0]

    // Find pending payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (paymentError || !payment) {
      console.log('[payment-webhook] No pending payment for user:', user.id)
      return json({ matched: false })
    }

    // Verify amount (499000 or 999000)
    const validAmounts = [499000, 999000]
    if (!validAmounts.includes(Number(amount))) {
      console.log('[payment-webhook] Amount mismatch:', amount, 'for payment:', payment.id)
      return json({ matched: false })
    }

    // Update payment to verified
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: 'auto-webhook',
      })
      .eq('id', payment.id)

    // Upgrade user tier
    await supabase
      .from('profiles')
      .update({ tier: payment.tier_target })
      .eq('id', user.id)

    console.log(`[payment-webhook] ✅ Upgraded user ${user.id} to ${payment.tier_target}`)
    return json({ matched: true, user_id: user.id, tier_activated: payment.tier_target })
  } catch (err) {
    console.error('[payment-webhook] Error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
