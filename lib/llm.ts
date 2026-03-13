// LLM client - wraps any OpenAI-compatible API endpoint.
// Models: 'MG' (standard), 'deep-theology' (deep search mode)

const MG_SYSTEM_PROMPT = `You are Gamaliel AI Pastor (MG Model), a Bible-based Christian AI assistant.
You answer with kindness, theological accuracy, and full fidelity to Scripture.
Always ground your answers in the Bible. When uncertain, acknowledge it and recommend
consulting a pastor. Never speculate or contradict Scripture.
Be concise, warm, and pastoral. Include relevant Bible references when helpful.
If asked about topics unrelated to faith, theology, or Christian life, gently
redirect the conversation back to spiritual guidance.`;

const DEEP_THEOLOGY_SYSTEM_PROMPT = `You are Gamaliel Deep Theology, an advanced theological research assistant.
You create comprehensive sermons and theological analyses with deep scholarly depth.
For every passage or topic, provide:
1. TEXTUAL BACKGROUND: Original language insights (Hebrew/Greek), manuscript context, authorship
2. HISTORICAL CONTEXT: Cultural, political, and social setting of the text
3. PHILOSOPHICAL DIMENSIONS: Theological implications, philosophical arguments, worldview analysis
4. ARCHAEOLOGICAL EVIDENCE: Relevant archaeological findings that illuminate the text
5. LOGICAL ANALYSIS: Systematic reasoning, doctrinal connections, hermeneutical principles
6. SERMON STRUCTURE: Introduction, main points, illustrations, application, conclusion
Be exhaustive, scholarly, and deeply rooted in Scripture. Reference commentaries, church fathers,
and theological traditions where relevant. This is deep search mode - thorough analysis only.`;

export type ModelType = 'MG' | 'deep-theology';

type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function callLlm(
  messages: { role: 'user' | 'assistant'; content: string }[],
  model: ModelType = 'MG'
): Promise<string> {
  const baseUrl = process.env.LLM_API_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const modelName = process.env.LLM_MODEL_NAME ?? 'gpt-3.5-turbo';

  if (!baseUrl || !apiKey) {
    return 'The AI service is not configured yet. Please set LLM_API_BASE_URL and LLM_API_KEY environment variables.';
  }

  const systemPrompt = model === 'deep-theology' ? DEEP_THEOLOGY_SYSTEM_PROMPT : MG_SYSTEM_PROMPT;
  const maxTokens = model === 'deep-theology' ? 4096 : 1024;
  const temperature = model === 'deep-theology' ? 0.5 : 0.7;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[LLM] Error:', res.status, err);
    throw new Error(`LLM_REQUEST_FAILED: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'I was unable to process that request. Please try again.';
}

export async function callLlmStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  model: ModelType = 'MG'
): Promise<ReadableStream<Uint8Array>> {
  const baseUrl = process.env.LLM_API_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const modelName = process.env.LLM_MODEL_NAME ?? 'gpt-3.5-turbo';

  if (!baseUrl || !apiKey) {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"AI service not configured."}}]}\n\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
  }

  const systemPrompt = model === 'deep-theology' ? DEEP_THEOLOGY_SYSTEM_PROMPT : MG_SYSTEM_PROMPT;
  const maxTokens = model === 'deep-theology' ? 4096 : 1024;
  const temperature = model === 'deep-theology' ? 0.5 : 0.7;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`LLM_REQUEST_FAILED: ${res.status}`);
  }

  return res.body;
}
