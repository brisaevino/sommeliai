// /api/chat.js
export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const messages = req.body.messages;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
