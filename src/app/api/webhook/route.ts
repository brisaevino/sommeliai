import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 500 });
  }

  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (resp.ok) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Erro ao enviar para o webhook.' }, { status: 500 });
  }
}