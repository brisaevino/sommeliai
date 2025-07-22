"use client";

export default function Header() {
  return (
    <header className="header" style={{ marginBottom: 0, borderRadius: "0 0 0 0", position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginBottom: 6 }}>
        {/* Avatar removido */}
        <h1 style={{
          margin: 0,
          fontSize: 48, // Aumentado de 36 para 48 para ficar mais proporcional
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: 0.5
        }}>
          SommeliAI
        </h1>
      </div>
      <p>Seu sommelier de bolso inteligente</p>
      <div className="header-buttons" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        width: '100%'
      }}>
        <button className="button modern-button" onClick={() => {
          window.location.href = '/';
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag('event', 'click_header_home', {
              event_category: 'Header',
              event_label: 'Página Inicial'
            });
          }
        }} style={{ width: '100%', maxWidth: '280px' }}>
          <span className="button-text">Página Inicial</span>
        </button>
        <button className="button modern-button" onClick={() => {
          window.location.href = '/preferidos';
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag('event', 'click_header_preferidos', {
              event_category: 'Header',
              event_label: 'Nossos Preferidos'
            });
          }
        }} style={{ width: '100%', maxWidth: '280px' }}>
          <span className="button-text">Nossos Preferidos</span>
        </button>
        <button className="button modern-button" onClick={() => {
          window.location.href = '/quiz';
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag('event', 'click_header_quiz', {
              event_category: 'Header',
              event_label: 'Quiz de Personalidade'
            });
          }
        }} style={{ width: '100%', maxWidth: '280px' }}>
          <span className="button-text">QUIZ DE PERSONALIDADE</span>
        </button>
        <button
          className="button modern-button"
          onClick={() => {
            window.location.href = '/?chat=true';
            if (typeof window !== "undefined" && window.gtag) {
              window.gtag('event', 'click_header_chat', {
                event_category: 'Header',
                event_label: 'Teste o Chat'
              });
            }
          }}
          style={{
            width: '100%',
            maxWidth: '280px',
            background: '#d9a441',
            color: '#fff',
            padding: '12px 24px', // igual aos outros botões
            borderRadius: '12px',
            fontWeight: '600',    // igual aos outros botões
            fontSize: '1rem',     // igual aos outros botões
            border: 'none',
            boxShadow: '0 2px 8px rgba(217,164,65,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            marginLeft: 0
          }}
        >
          <span style={{ fontWeight: '600' }}>TESTE O CHAT!</span>
        </button>
      </div>
    </header>
  );
}
