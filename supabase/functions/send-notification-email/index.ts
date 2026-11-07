// Supabase Edge Function: send-notification-email
// Transactional email dispatcher for GrindOS candidates (streak alerts, digests, offer celebrations).
// Integrates with Resend API on Deno runtime.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = Deno.env.get('NOTIFICATION_FROM_EMAIL') || 'notifications@grindos.dev';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const payload = await req.json();
    const { toEmail, candidateName, type, data } = payload;

    if (!toEmail) {
      return new Response(JSON.stringify({ error: 'Missing toEmail parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!RESEND_API_KEY) {
      console.warn('[send-notification-email] No RESEND_API_KEY configured. Simulating dispatch for:', toEmail);
      return new Response(JSON.stringify({ simulated: true, toEmail }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const subjects: Record<string, string> = {
      streak_alert: `⚡ Your ${data?.currentStreak || 1}-day streak is at risk — ${data?.hoursRemaining || 6}h left`,
      weekly_digest: `📊 Your GrindOS week recap — Day ${data?.currentDay || 1} of 140`,
      offer_celebration: `🎉 Massive congratulations on your offer from ${data?.company || 'Top Tech'}!`,
      welcome: `Welcome to GrindOS, ${candidateName || 'Engineer'}!`,
    };

    const subject = subjects[type] || 'GrindOS Notification';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: toEmail,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111;">
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">${subject}</div>
            <p style="font-size: 14px; line-height: 1.6; color: #333;">Hi ${candidateName || 'there'},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #333;">
              ${type === 'streak_alert' ? `Your daily problem solving streak (${data?.currentStreak} days) will reset if you don't solve your target problems today.` : ''}
              ${type === 'weekly_digest' ? `This week you solved ${data?.solvesThisWeek || 0} problems! Your overall placement readiness is now at ${data?.readinessPct || 0}%.` : ''}
              ${type === 'offer_celebration' ? `We are thrilled to celebrate your offer at ${data?.company} for the ${data?.role} role! 🏆` : ''}
              ${type === 'welcome' ? `Welcome to GrindOS. Your 140-day structured roadmap to Tier-1 software engineering roles starts now.` : ''}
            </p>
            ${data?.ctaUrl ? `
              <div style="margin-top: 24px;">
                <a href="${data.ctaUrl}" style="background: #000; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">
                  Open GrindOS Dashboard
                </a>
              </div>
            ` : ''}
            <div style="margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #888;">
              GrindOS — Minimalist Placement Operating System • Sent from your cloud workspace.
            </div>
          </div>
        `,
      }),
    });

    const resData = await res.json();
    if (!res.ok) {
      console.error('[send-notification-email] Resend API error:', resData);
      return new Response(JSON.stringify({ error: resData }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[send-notification-email] Dispatch exception:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
