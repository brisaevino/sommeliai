export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.OPENAI_API_KEY;
  const messages = req.body.messages;

  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY não configurada." });
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Mensagens inválidas ou ausentes." });
  }

  try {
    // 🔥 Enviar evento pro Google Analytics
    fetch("https://www.google-analytics.com/mp/collect?measurement_id=G-QKKQF64KX1&api_secret=aVK4zKvwSRCzfxgWoPfUDA", {
      method: "POST",
      body: JSON.stringify({
        client_id: Math.random().toString(36).substring(2), // ID aleatório por sessão
        events: [
          {
            name: "chat_mensagem_enviada",
            params: {
              origem: "chat-lillo",
              num_mensagens: messages.length,
              primeira_mensagem: messages[0]?.content || "sem conteúdo",
            }
          }
        ]
      })
    }).catch(() => {}); // ignora erro se analytics falhar

    // Chamada para a OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
