import { supabaseAdmin } from './supabaseAdmin';

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  paid: 100,
};

export async function getUserPlanAndUsage(userId: string) {
  // Get user from public.users (created by trigger on auth.users insert)
  let { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, tier')
    .eq('id', userId)
    .single();

  // Auto-create user if not found (fallback)
  if (userError || !user) {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = authData?.user?.email ?? '';
    const { data: created } = await supabaseAdmin
      .from('users')
      .insert({ id: userId, email, tier: 'free' })
      .select('id, tier')
      .single();
    user = created ?? { id: userId, tier: 'free' };
  }

  const tier = (user as any).tier ?? 'free';
  const dailyLimit = PLAN_LIMITS[tier] ?? 10;
  const today = new Date().toISOString().slice(0, 10);

  // Get or create today's usage row
  let { data: usageRow } = await supabaseAdmin
    .from('usage_tracking')
    .select('id, messages_used')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (!usageRow) {
    const { data: newRow } = await supabaseAdmin
      .from('usage_tracking')
      .insert({ user_id: userId, date: today, messages_used: 0 })
      .select('id, messages_used')
      .single();
    usageRow = newRow;
  }

  return {
    planId: tier as string,
    dailyLimit,
    usageRowId: (usageRow as any)?.id ?? null,
    messagesUsed: (usageRow as any)?.messages_used ?? 0,
    today,
  };
}

export async function incrementUsage(
  userId: string,
  today: string,
  usageRowId: string | null
) {
  if (usageRowId) {
    // Read current count then increment
    const { data: current } = await supabaseAdmin
      .from('usage_tracking')
      .select('messages_used')
      .eq('id', usageRowId)
      .single();
    const newCount = ((current as any)?.messages_used ?? 0) + 1;
    await supabaseAdmin
      .from('usage_tracking')
      .update({ messages_used: newCount })
      .eq('id', usageRowId);
  } else {
    await supabaseAdmin
      .from('usage_tracking')
      .insert({ user_id: userId, date: today, messages_used: 1 });
  }
}

export async function checkUsageLimit(userId: string) {
  const usage = await getUserPlanAndUsage(userId);
  return {
    allowed: usage.messagesUsed < usage.dailyLimit,
    usage,
  };
}
