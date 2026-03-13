import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUserPlanAndUsage, incrementUsage } from '@/lib/usage';
import { detectLanguage, translateToEnglish, translateFromEnglish } from '@/lib/i18n';
import { callLlm } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

        // 1. Authenticate user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // 2. Check plan + usage
    const { planId, dailyLimit, usageRowId, messagesUsed, today } = await getUserPlanAndUsage(user.id);

    if (messagesUsed >= dailyLimit) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        messagesUsed,
        dailyLimit,
        plan: planId,
        upgradeUrl: '/billing',
      }, { status: 429 });
    }

    // 3. Detect language and translate to English
    const detectedLang = await detectLanguage(message);
    const englishMessage = await translateToEnglish(message, detectedLang);

    // 4. Load conversation history (last 10 messages)
    let historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (conversationId) {
      const { data: history } = await supabaseAdmin
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (history) {
        historyMessages = history.map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      }
    }

    // 5. Call LLM
    const englishAnswer = await callLlm([
      ...historyMessages,
      { role: 'user', content: englishMessage },
    ]);

    // 6. Translate answer back
    const finalAnswer = await translateFromEnglish(englishAnswer, detectedLang);

    // 7. Persist conversation and messages
    let convId = conversationId;
    if (!convId) {
      const { data: conv, error: convErr } = await supabaseAdmin
        .from('conversations')
        .insert({ user_id: user.id, title: message.slice(0, 100) })
        .select('id')
        .single();

      if (convErr || !conv) throw new Error('CONVERSATION_CREATE_FAILED');
      convId = conv.id;
    }

    await supabaseAdmin.from('messages').insert([
      { conversation_id: convId, user_id: user.id, role: 'user', content: message, language_code: detectedLang },
      { conversation_id: convId, user_id: user.id, role: 'assistant', content: finalAnswer, language_code: detectedLang },
    ]);

    // 8. Increment usage
    await incrementUsage(user.id, today, usageRowId);

    return NextResponse.json({
      conversationId: convId,
      reply: finalAnswer,
      usage: { messagesUsed: messagesUsed + 1, dailyLimit, plan: planId },
    });
  } catch (err: any) {
    console.error('[/api/chat]', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
