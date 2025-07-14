"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import NewsletterForm from "./NewsletterForm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { systemPrompt } from "../lib/prompt";

export default function Hero() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Olá! Sou o SommeliAI — posso te ajudar a escolher o vinho ideal. Me conta o que você procura!

1. Tô em dúvida entre dois vinhos
2. Quero uma sugestão pra uma ocasião especial
3. Quero um vinho que combine com o prato que eu escolhi`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userEmojis, setUserEmojis] = useState<{[key: number]: string}>({});
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // ADICIONADO: Verificar se deve abrir chat automaticamente
  useEffect(() => {
    if (searchParams.get('chat') === 'true') {
      setShowChat(true);
    }
  }, [searchParams]);

  // Array de emojis variados para o usuário
  const availableEmojis = ["😊", "😄", "🙂", "😎", "🤗", "😌", "🤔", "😉", "🥰", "😋", "🤩", "😇", "🙃", "😌", "😘"];

  // Função para pegar um emoji aleatório
  const getRandomEmoji = () => {
    return availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const messageIndex = messages.length;
    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    
    // Atribuir um emoji aleatório para esta mensagem do usuário
    setUserEmojis(prev => ({
      ...prev,
      [messageIndex]: getRandomEmoji()
    }));
    
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: systemPrompt }, ...newMessages],
        }),
      });

      const data = await res.json();
      const assistantMsg = {
        role: "assistant",
        content: data.answer || `Erro: ${data.error || "Erro ao obter resposta."}`,
      };

      setMessages([...newMessages, assistantMsg]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Erro ao conectar à API." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startChat = () => {
    setShowChat(true);
  };

  const restartChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Oi de novo! 🍇 Qual vinho combina com seu momento hoje?

1. Tô em dúvida entre dois vinhos
2. Quero uma sugestão pra uma ocasião especial
3. Quero um vinho que combine com o prato que eu escolhi`,
      },
    ]);
    setShowChat(true);
  };

  const backToHome = () => {
    setShowChat(false);
    setMessages([
      {
        role: "assistant",
        content: `Olá! Sou o SommeliAI — posso te ajudar a escolher o vinho ideal. Me conta o que você procura!

1. Tô em dúvida entre dois vinhos
2. Quero uma sugestão pra uma ocasião especial
3. Quero um vinho que combine com o prato que eu escolhi`,
      },
    ]);
  };

  if (showChat) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f5f0ea 100%)' }}>
        {/* Header do Chat */}
        <div className="border-b p-4 sticky top-0 z-50 backdrop-blur-sm" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.9) 100%)',
          borderColor: 'rgba(217, 164, 65, 0.3)',
          boxShadow: '0 4px 20px rgba(122, 46, 30, 0.08)'
        }}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <button
                onClick={backToHome}
                className="group flex items-center space-x-2 transition-colors"
                style={{ color: '#d9a441' }}
              >
                <svg
                  className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Voltar</span>
              </button>
              <div className="w-px h-6" style={{ backgroundColor: '#d9a441' }} />
              <div className="flex items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold" style={{ color: '#7a2e1e' }}>SommeliAI</h3>
                  <p className="text-sm" style={{ color: '#7a2e1e' }}>Seu sommelier digital</p>
                </div>
              </div>
            </div>
            <button 
              onClick={restartChat}
              className="px-5 py-2.5 rounded-full font-medium transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #d9a441 0%, #c9932a 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(217, 164, 65, 0.3)'
              }}
            >
              Recomeçar
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full" ref={chatContainerRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start mb-6 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mx-4 flex-shrink-0 overflow-hidden ${
                msg.role === "user" ? "" : ""
              }`}
              style={msg.role === "user"
                ? {
                    background: 'linear-gradient(135deg, #7a2e1e 0%, #5d1f14 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(122, 46, 30, 0.3)'
                  }
                : {
                    background: 'linear-gradient(135deg, #d9a441 0%, #c9932a 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(217, 164, 65, 0.3)'
                  }
              }>
                {msg.role === "user" ? (userEmojis[i] || "😊") : (
                  <img
                    src="/bot-avatar.png"
                    alt="SommeliAI"
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </div>
              
              {/* Conteúdo da Mensagem */}
              <div className={`chat-message max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-5 rounded-3xl ${
                msg.role === "user"
                  ? "font-medium rounded-tr-md"
                  : "rounded-tl-md"
              }`}
              style={msg.role === "user"
                ? {
                    background: 'linear-gradient(135deg, #7a2e1e 0%, #5d1f14 100%)',
                    color: 'white',
                    boxShadow: '0 6px 20px rgba(122, 46, 30, 0.25)'
                  }
                : {
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.9) 100%)',
                    border: '1px solid rgba(217, 164, 65, 0.2)',
                    color: '#7a2e1e',
                    boxShadow: '0 6px 20px rgba(217, 164, 65, 0.1)'
                  }
              }>
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="sommelier-table">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead>
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody>
                          {children}
                        </tbody>
                      ),
                      th: ({ children }) => (
                        <th>
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td>
                          {children}
                        </td>
                      ),
                      tr: ({ children }) => (
                        <tr>
                          {children}
                        </tr>
                      )
                    }}
                  >
                    {msg.content.trim()}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-4 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #d9a441 0%, #c9932a 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(217, 164, 65, 0.3)'
                }}
              >
                <img
                  src="/bot-avatar.png"
                  alt="SommeliAI"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="p-5 rounded-3xl rounded-tl-md" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.9) 100%)',
                border: '1px solid rgba(217, 164, 65, 0.2)',
                boxShadow: '0 6px 20px rgba(217, 164, 65, 0.1)'
              }}>
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#d9a441' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#d9a441', animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#d9a441', animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-5 sticky bottom-0 backdrop-blur-sm" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.9) 100%)',
          borderColor: 'rgba(217, 164, 65, 0.3)',
          boxShadow: '0 -4px 20px rgba(122, 46, 30, 0.08)'
        }}>
          <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva para descobrir a sua próxima rolha"
              disabled={loading}
              className="flex-1 p-4 rounded-full focus:outline-none transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid rgba(217, 164, 65, 0.3)',
                color: '#7a2e1e',
                boxShadow: '0 4px 12px rgba(217, 164, 65, 0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#d9a441';
                e.target.style.boxShadow = '0 4px 16px rgba(217, 164, 65, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(217, 164, 65, 0.3)';
                e.target.style.boxShadow = '0 4px 12px rgba(217, 164, 65, 0.1)';
              }}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #d9a441 0%, #c9932a 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(217, 164, 65, 0.3)'
              }}
            >
              <img
                src="/sacarolha.png"
                alt="Enviar"
                className="w-7 h-7"
              />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#f3edea' }}>
      <div className="max-w-6xl w-full text-center">
        {/* Hero Text */}
        <div className="mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: '#7a2e1e' }}>
            Descubra o vinho perfeito para <span style={{ color: '#d9a441' }}>cada momento</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#7a2e1e' }}>
            SommeliAI é seu sommelier digital que entende suas preferências e te guia para escolher o vinho certo. 
            Harmonizações perfeitas, recomendações personalizadas e muito mais!
          </p>
          <div className="flex justify-center">
            <button 
              onClick={startChat}
              className="font-semibold text-xl px-8 py-4 rounded-full hover:scale-105 transition-all shadow-lg flex items-center gap-3"
              style={{ background: 'linear-gradient(to right, #d9a441, #c9932a)', color: 'white' }}
            >
              <img
                src="/chat-white.svg"
                alt="Chat"
                className="w-6 h-6"
              />
              Converse com o SommeliAI
            </button>
          </div>
        </div>

        {/* Como Funciona - 3 Etapas com Setas */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#7a2e1e' }}>
            Como funciona?
          </h2>
          <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(122, 46, 30, 0.7)' }}>
            Em apenas 3 passos simples, você encontra o vinho ideal para qualquer ocasião
          </p>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
              {/* Etapa 1 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold transition-all group-hover:scale-110" style={{
                    background: 'linear-gradient(135deg, #d9a441 0%, #c9932a 100%)',
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(217, 164, 65, 0.3)'
                  }}>
                    1
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    ✓
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#7a2e1e' }}>
                  Conte suas preferências
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(122, 46, 30, 0.7)' }}>
                  Descreva o que você procura: ocasião, prato, orçamento ou dúvidas entre vinhos
                </p>
              </div>

              {/* Seta 1 → 2 */}
              <div className="hidden md:flex justify-center">
                <div className="text-4xl animate-pulse" style={{ color: '#d9a441' }}>
                  →
                </div>
              </div>

              {/* Etapa 2 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold transition-all group-hover:scale-110" style={{
                    background: 'linear-gradient(135deg, #d9a441 0%, #c9932a 100%)',
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(217, 164, 65, 0.3)'
                  }}>
                    2
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    🤖
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#7a2e1e' }}>
                  IA analisa e recomenda
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(122, 46, 30, 0.7)' }}>
                  Nossa inteligência artificial processa suas informações e gera sugestões personalizadas
                </p>
              </div>

              {/* Seta 2 → 3 */}
              <div className="hidden md:flex justify-center">
                <div className="text-4xl animate-pulse" style={{ color: '#d9a441' }}>
                  →
                </div>
              </div>

              {/* Etapa 3 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold transition-all group-hover:scale-110" style={{
                    background: 'linear-gradient(135deg, #d9a441 0%, #c9932a 100%)',
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(217, 164, 65, 0.3)'
                  }}>
                    3
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    🍷
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#7a2e1e' }}>
                  Desfrute sua escolha
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(122, 46, 30, 0.7)' }}>
                  Receba recomendações completas com harmonizações e onde encontrar o vinho ideal
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Metrics Section - OS 3 QUADRADOS */}
        <div className="mb-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.9) 100%)',
              border: '1px solid rgba(217, 164, 65, 0.2)',
              boxShadow: '0 4px 20px rgba(122, 46, 30, 0.08)'
            }}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#d9a441' }}>200+</div>
              <div className="text-lg font-medium mb-1" style={{ color: '#7a2e1e' }}>Pessoas encontraram</div>
              <div className="text-sm" style={{ color: 'rgba(122, 46, 30, 0.7)' }}>o vinho perfeito</div>
            </div>
            
            <div className="text-center p-6 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.9) 100%)',
              border: '1px solid rgba(217, 164, 65, 0.2)',
              boxShadow: '0 4px 20px rgba(122, 46, 30, 0.08)'
            }}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#d9a441' }}>24/7</div>
              <div className="text-lg font-medium mb-1" style={{ color: '#7a2e1e' }}>Sempre online</div>
              <div className="text-sm" style={{ color: 'rgba(122, 46, 30, 0.7)' }}>a seu dispor</div>
            </div>
            
            <div className="text-center p-6 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.9) 100%)',
              border: '1px solid rgba(217, 164, 65, 0.2)',
              boxShadow: '0 4px 20px rgba(122, 46, 30, 0.08)'
            }}>
              <div className="text-3xl font-bold mb-2" style={{ color: '#d9a441' }}>100%</div>
              <div className="text-lg font-medium mb-1" style={{ color: '#7a2e1e' }}>Personalizado</div>
              <div className="text-sm" style={{ color: 'rgba(122, 46, 30, 0.7)' }}>para seu gosto</div>
            </div>
          </div>
        </div>

        {/* Newsletter - Agora separado */}
        <div className="mb-12">
          <NewsletterForm />
        </div>

        {/* Patrocínio - MAIS DISCRETO */}
        <div className="mt-16">
          <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 hover:shadow-md" 
                 style={{ 
                   background: 'rgba(255, 255, 255, 0.7)', 
                   borderColor: 'rgba(217, 164, 65, 0.2)',
                   backdropFilter: 'blur(10px)'
                 }}>
              
              <div className="text-center">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg" style={{ color: '#7a2e1e' }}>Espaço publicitário</h3>
                </div>
                <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'rgba(122, 46, 30, 0.6)' }}>
                  Alcance apreciadores de vinho com sua marca
                </p>
                
                <a
                  href="mailto:brisaevino@gmail.com?subject=Interesse em anunciar no SommeliAI&body=Olá! Gostaria de saber mais sobre as oportunidades de anúncio no SommeliAI."
                  className="inline-block text-sm font-medium px-6 py-2.5 rounded-full transition-all hover:scale-105"
                  style={{ 
                    background: 'rgba(217, 164, 65, 0.1)', 
                    color: '#d9a441',
                    border: '1px solid rgba(217, 164, 65, 0.3)'
                  }}
                >
                  Entre em contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}