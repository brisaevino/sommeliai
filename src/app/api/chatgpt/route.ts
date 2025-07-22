import { systemPrompt } from '@/lib/prompt';

export async function POST(req: Request) {
  console.log("🔥 ChatGPT API iniciada");
  
  try {
    // Verificar se é uma requisição válida
    if (!req) {
      console.error("❌ Request inválido");
      return Response.json({ error: "Request inválido" }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
      console.log("✅ Body recebido:", body);
    } catch (parseError) {
      console.error("❌ Erro ao parsear JSON do body:", parseError);
      return Response.json({ error: "JSON inválido no body da requisição" }, { status: 400 });
    }
    
    const { messages } = body;

    // Verificar se messages existe e é um array válido
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("❌ Messages inválido:", messages);
      return Response.json({ error: "Campo 'messages' é obrigatório e deve ser um array não vazio" }, { status: 400 });
    }

    // Verificar se a API key existe
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY não configurada");
      return Response.json({ error: "API key não configurada no servidor" }, { status: 500 });
    }

    console.log("🔑 API Key encontrada:", apiKey.substring(0, 20) + "...");
    console.log("📝 Enviando mensagens para OpenAI:", messages);

    // Adicione o prompt aqui, no backend:
    const messagesWithPrompt = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Fazer requisição para OpenAI
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

    console.log("📡 Status da resposta OpenAI:", openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("❌ Erro da OpenAI:", errorData);
      return Response.json({ 
        error: `Erro da OpenAI: ${openaiResponse.status} - ${errorData}` 
      }, { status: openaiResponse.status });
    }

    const data = await openaiResponse.json();
    console.log("✅ Resposta da OpenAI:", data);

    // Extrair a resposta
    const answer = data.choices?.[0]?.message?.content;
    
    if (!answer) {
      console.error("❌ Resposta vazia da OpenAI:", data);
      return Response.json({ error: "Resposta vazia da OpenAI" }, { status: 500 });
    }

    console.log("🎉 Sucesso! Retornando resposta:", answer);
    return Response.json({ answer });

  } catch (error) {
    console.error("💥 Erro geral na API:", error);
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
