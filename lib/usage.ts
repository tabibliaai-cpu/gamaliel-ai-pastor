import { supabaseAdmin } from './supabaseAdmin';

export async function getUserPlanAndUsage(userId: string) {
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, plan')
    .eq('id', userId)
    .single();

  if (userError || !user) throw new Error('USER_NOT_FOUND');

  // Get or create user plan
  let { data: plan, error: planError } = await supabaseAdmin
    .from('plans')
    .select('id, daily_message_limit')
    .eq('id', user.plan)
    .single();

  if (planError || !plan) {
    // If no plan found, create a default free plan entry for this user
    const { data: newPlan, error: createError } = await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: userId,
        plan_type: 'free',
        daily_message_limit: 10,
        messages_used: 0
      })
      .select('*')
      .single();

    if (createError || !newPlan) throw new Error('FAILED_TO_CREATE_PLAN');
    
    return {
      planId: newPlan.id as string,
      dailyLimit: 10,
      usageRowId: newPlan.id,
      messagesUsed: 0,
      today: new Date().toISOString().slice(0, 10)
    };
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC

  // Get or create usage row for today
  let { data: usageRow } = await supabaseAdmin
    .from('usage_daily')
    .select('id, messages_used')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (!usageRow) {
    // Create new usage row for today
    const { data: newUsageRow, error: usageError } = await supabaseAdmin
      .from('usage_daily')
      .insert({ user_id: userId, date: today, messages_used: 0 })
      .select('id, messages_used')
      .single();
    
    if (usageError || !newUsageRow) throw new Error('FAILED_TO_CREATE_USAGE');
    usageRow = newUsageRow;
  }

  return {
    planId: plan.id as string,
    dailyLimit: plan.daily_message_limit as number,
    usageRowId: usageRow.id ?? null,
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
    const { error } = await supabaseAdmin.rpc('increment_message_count', {
      row_id: usageRowId,
    });
    if (error) console.error('Failed to increment usage:', error);
  } else {
    // Fallback: insert new row
    const { error } = await supabaseAdmin
      .from('usage_daily')
      .insert({ user_id: userId, date: today, messages_used: 1 });
    if (error) console.error('Failed to create usage row:', error);
  }
}

export async function checkUsageLimit(userId: string) {
  const usage = await getUserPlanAndUsage(userId);
  if (usage.messagesUsed >= usage.dailyLimit) {
    return { allowed: false, usage };
  }
  return { allowed: true, usage };
}
