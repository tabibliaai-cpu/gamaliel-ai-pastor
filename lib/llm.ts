// LLM client - wraps any OpenAI-compatible API endpoint.
// Set LLM_API_BASE_URL, LLM_API_KEY, and LLM_MODEL_NAME in environment variables.

const SYSTEM_PROMPT = `You are Gamaliel AI Pastor, a Bible-based Christian AI assistant.
You answer with kindness, theological accuracy, and full fidelity to Scripture.
Always ground your answers in the Bible. When uncertain, acknowledge it and recommend
consulting a pastor. Never speculate or contradict Scripture.
Be concise, warm, and pastoral. Include relevant Bible references when helpful.
If asked about topics unrelated to faith, theology, or Christian life, gently
redirect the conversation back to spiritual guidance.`;

type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function callLlm(messages: Omit<LlmMessage, 'role' | 'content'>[] | { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const baseUrl = process.env.LLM_API_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL_NAME ?? 'gpt-3.5-turbo';

  if (!baseUrl || !apiKey) {
    return 'The AI service is not configured yet. Please set LLM_API_BASE_URL and LLM_API_KEY environment variables.';
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
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
