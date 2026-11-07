// Supabase Edge Function: stripe-webhook
// Secure server-side fulfillment for GrindOS Lifetime Pro license checkout.
// Runs on Deno runtime within Supabase Edge Functions.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[stripe-webhook] Webhook signature verification failed: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email?.toLowerCase() || session.customer_email?.toLowerCase();

    if (!customerEmail) {
      console.warn('[stripe-webhook] No email associated with checkout session:', session.id);
      return new Response('Missing customer email in session', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[stripe-webhook] Missing Supabase service credentials');
      return new Response('Server configuration error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Locate auth user by email
    const { data, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error('[stripe-webhook] Error querying user accounts:', userError.message);
      return new Response('Internal error finding user', { status: 500 });
    }

    const targetUser = data.users.find((u) => u.email?.toLowerCase() === customerEmail);

    if (targetUser) {
      // 2. Grant lifetime Pro privileges
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ is_pro: true })
        .eq('user_id', targetUser.id);

      if (updateError) {
        console.error('[stripe-webhook] Error updating user profile Pro flag:', updateError.message);
        return new Response('Database update error', { status: 500 });
      }

      console.log(`[stripe-webhook] Successfully activated Lifetime Pro for user: ${targetUser.id} (${customerEmail})`);
    } else {
      console.warn(`[stripe-webhook] Checkout completed for email ${customerEmail}, but user not yet registered in auth.`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
