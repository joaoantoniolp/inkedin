import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  const navigate  = useNavigate();
  const usuario   = JSON.parse(localStorage.getItem('usuario') || 'null');

  const handleExplorar = () => navigate('/busca');

  const handleDashboard = () => {
    if (!usuario) { navigate('/login'); return; }
    navigate(usuario.tipo === 'tatuador' ? '/dashboard-tattoo' : '/dashboard-cliente');
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-conteudo">
          <span className="hero-badge">✦ Plataforma de tatuagem</span>
          <h1 className="hero-titulo">
            Encontre o tatuador<br />
            <span className="hero-destaque">perfeito para você</span>
          </h1>
          <p className="hero-subtitulo">
            Conectamos você aos melhores artistas de tatuagem do Brasil.
            Filtre por estilo, cidade e avaliação.
          </p>
          <div className="hero-acoes">
            <button className="btn-primario" onClick={handleExplorar}>
              Explorar tatuadores
            </button>
            {usuario ? (
              <button className="btn-secundario" onClick={handleDashboard}>
                Meu painel →
              </button>
            ) : (
              <button className="btn-secundario" onClick={() => navigate('/cadastro')}>
                Criar conta grátis
              </button>
            )}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-badge-flutuante badge-1">✦ Realismo</div>
          <div className="hero-badge-flutuante badge-2">✦ Blackwork</div>
          <div className="hero-badge-flutuante badge-3">✦ Fine Line</div>
          <div className="hero-badge-flutuante badge-4">✦ Old School</div>
          <div className="hero-logo-grande">INK</div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="como-funciona">
        <h2>Como funciona</h2>
        <div className="passos">
          <div className="passo">
            <span className="passo-numero">01</span>
            <h3>Busque</h3>
            <p>Use os filtros para encontrar tatuadores por estilo, cidade e faixa de preço.</p>
          </div>
          <div className="passo-seta">→</div>
          <div className="passo">
            <span className="passo-numero">02</span>
            <h3>Explore</h3>
            <p>Veja o portfólio completo e as avaliações de outros clientes.</p>
          </div>
          <div className="passo-seta">→</div>
          <div className="passo">
            <span className="passo-numero">03</span>
            <h3>Conecte</h3>
            <p>Entre em contato diretamente com o tatuador pelo Instagram ou WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* Estilos em destaque */}
      <section className="estilos-section">
        <h2>Estilos populares</h2>
        <div className="estilos-grid">
          {[
            { nome: 'Realismo',   emoji: '🎨' },
            { nome: 'Blackwork',  emoji: '⬛' },
            { nome: 'Old School', emoji: '⚓' },
            { nome: 'Fine Line',  emoji: '✏️' },
            { nome: 'Aquarela',   emoji: '🌊' },
            { nome: 'Oriental',   emoji: '🐉' },
          ].map(e => (
            <button
              key={e.nome}
              className="estilo-card"
              onClick={() => navigate(`/busca?estilo=${e.nome}`)}
            >
              <span className="estilo-emoji">{e.emoji}</span>
              <span className="estilo-nome">{e.nome}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="cta">
        <h2>É tatuador?</h2>
        <p>Crie seu perfil, publique seu portfólio e apareça para milhares de clientes.</p>
        <button className="btn-primario" onClick={() => navigate('/cadastro')}>
          Cadastrar como tatuador
        </button>
      </section>
    </>
  );
}
