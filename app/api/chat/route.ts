import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUserPlanAndUsage, incrementUsage } from '@/lib/usage';
import { detectLanguage, translateToEnglish, translateFromEnglish } from '@/lib/i18n';
import { callLlmStream, ModelType } from '@/lib/llm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, model = 'MG' } = body;

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
        upgradeUrl: '/dashboard#upgrade',
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

    // 5. Call LLM with streaming
    const llmModel: ModelType = model === 'deep-theology' ? 'deep-theology' : 'MG';
    const stream = await callLlmStream([
      ...historyMessages,
      { role: 'user', content: englishMessage },
    ], llmModel);

    // 6. Collect full response for saving, stream to client
    let fullResponse = '';
    const encoder = new TextEncoder();
    let convId = conversationId;

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content || '';
              if (content) fullResponse += content;
            } catch {}
          }
        }
        controller.enqueue(chunk);
      },
      async flush(controller) {
        // After stream ends, save to DB and increment usage
        try {
          const finalAnswer = detectedLang !== 'en'
            ? await translateFromEnglish(fullResponse, detectedLang)
            : fullResponse;

          if (!convId) {
            const { data: conv } = await supabaseAdmin
              .from('conversations')
              .insert({ user_id: user.id, title: message.slice(0, 100) })
              .select('id')
              .single();
            if (conv) convId = conv.id;
          }

          if (convId) {
            await supabaseAdmin.from('messages').insert([
              { conversation_id: convId, user_id: user.id, role: 'user', content: message, language_code: detectedLang },
              { conversation_id: convId, user_id: user.id, role: 'assistant', content: finalAnswer, language_code: detectedLang },
            ]);
          }

          await incrementUsage(user.id, today, usageRowId);
        } catch (e) {
          console.error('[chat/flush]', e);
        }
      }
    });

    return new NextResponse(stream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Conversation-Id': convId || '',
        'X-Usage-Used': String(messagesUsed + 1),
        'X-Usage-Limit': String(dailyLimit),
        'X-Usage-Plan': planId,
      },
    });
  } catch (err: any) {
    console.error('[/api/chat]', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
