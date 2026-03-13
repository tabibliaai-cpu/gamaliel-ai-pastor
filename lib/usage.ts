import { supabaseAdmin } from './supabaseAdmin';

export async function getUserPlanAndUsage(userId: string) {
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, plan')
    .eq('id', userId)
    .single();

  if (userError || !user) throw new Error('USER_NOT_FOUND');

  const { data: plan, error: planError } = await supabaseAdmin
    .from('plans')
    .select('id, daily_message_limit')
    .eq('id', user.plan)
    .single();

  if (planError || !plan) throw new Error('PLAN_NOT_FOUND');

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC

  const { data: usageRow } = await supabaseAdmin
    .from('usage_daily')
    .select('id, messages_used')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  return {
    planId: plan.id as string,
    dailyLimit: plan.daily_message_limit as number,
    usageRowId: usageRow?.id ?? null,
    messagesUsed: usageRow?.messages_used ?? 0,
    today,
  };
}

export async function incrementUsage(
  userId: string,
  today: string,
  usageRowId: number | null
) {
  if (usageRowId !== null) {
    // Increment existing row using Postgres raw RPC to avoid race conditions
    await supabaseAdmin.rpc('increment_usage', { row_id: usageRowId });
  } else {
    // Insert new row for today
    const { error } = await supabaseAdmin.from('usage_daily').insert({
      user_id: userId,
      date: today,
      messages_used: 1,
    });
    if (error) throw new Error('USAGE_INSERT_FAILED: ' + error.message);
  }
}
