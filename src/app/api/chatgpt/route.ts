import { systemPrompt } from '@/lib/prompt';

export async function POST(req: Request) {
  try {
    if (!req) {
      return Response.json({ error: "Request inválido" }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "JSON inválido no body da requisição" }, { status: 400 });
    }
    
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Campo 'messages' é obrigatório e deve ser um array não vazio" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key não configurada no servidor" }, { status: 500 });
    }

    const messagesWithPrompt = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messagesWithPrompt,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      return Response.json({ 
        error: `Erro da OpenAI: ${openaiResponse.status} - ${errorData}` 
      }, { status: openaiResponse.status });
    }

    const data = await openaiResponse.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return Response.json({ error: "Resposta vazia da OpenAI" }, { status: 500 });
    }

    // Enviar para o webhook (Google Apps Script)
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      // Você pode enviar as mensagens do usuário e a resposta do assistente
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          answer,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return Response.json({ answer });

  } catch (error) {
    return Response.json({ 
      error: `Erro interno: ${error instanceof Error ? error.message : "Erro desconhecido"}` 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
