// Supabase Edge Function: admin-telemetry
// Secure administrative aggregation using service_role key to bypass client RLS.
// Runs on Deno runtime within Supabase Edge Functions.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const KNOWN_ADMINS = [
  'admin@grindos.dev',
  'founder@grindos.dev',
  'email2devanshkr@gmail.com',
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // 1. Authenticate caller via authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing backend service credentials' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify caller using anon client with user's JWT
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized user token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userEmail = (user.email || '').toLowerCase().trim();

  // 2. Authorize admin privileges
  let isAuthorized = KNOWN_ADMINS.includes(userEmail);

  if (!isAuthorized) {
    const { data: adminRow } = await userClient
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminRow && (adminRow.role === 'admin' || adminRow.role === 'superadmin')) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Aggregate cross-user metrics using service_role client
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      profilesRes,
      solvesTodayRes,
      totalSolvesRes,
      recentProgressRes,
      placementsRes,
      cohortsRes
    ] = await Promise.all([
      adminClient.from('user_profiles').select('target_company, target_tier, created_at'),
      adminClient.from('user_progress').select('id', { count: 'exact', head: true }).gte('solved_at', todayStart.toISOString()),
      adminClient.from('user_progress').select('id', { count: 'exact', head: true }),
      adminClient.from('user_progress').select('user_id').gte('solved_at', sevenDaysAgo.toISOString()),
      adminClient.from('placement_records').select('stage'),
      adminClient.from('cohorts').select('id', { count: 'exact', head: true })
    ]);

    const profiles = profilesRes.data || [];
    const totalRegisteredUsers = profiles.length;

    // Company and tier breakdowns
    const companyCounts: Record<string, number> = {};
    const tierCounts: Record<string, number> = {};

    profiles.forEach((p) => {
      const comp = (p.target_company || 'Top Tech Roles').trim();
      companyCounts[comp] = (companyCounts[comp] || 0) + 1;

      const tier = (p.target_tier || 'tier1').trim();
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });

    const companyDistribution = Object.entries(companyCounts)
      .map(([company, count]) => ({
        company,
        count,
        percentage: totalRegisteredUsers > 0 ? Math.round((count / totalRegisteredUsers) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => ({
      tier: tier === 'tier1' ? 'Tier-1 / FAANG' : tier === 'tier2' ? 'Mid-Market' : 'Startup / Other',
      count,
    }));

    const activeUserSet = new Set((recentProgressRes.data || []).map((r) => r.user_id));
    const activeSolvers7d = activeUserSet.size;

    const placements = placementsRes.data || [];
    const totalApps = placements.length;
    const offers = placements.filter((p) => p.stage?.includes('Offer')).length;
    const offerConversionRate = totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0;

    const telemetry = {
      totalRegisteredUsers,
      activeSolvers7d,
      solvesToday: solvesTodayRes.count || 0,
      totalSolvesCount: totalSolvesRes.count || 0,
      offerConversionRate,
      totalCohorts: cohortsRes.count || 0,
      companyDistribution,
      tierDistribution,
    };

    return new Response(JSON.stringify(telemetry), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[admin-telemetry] Aggregation error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
