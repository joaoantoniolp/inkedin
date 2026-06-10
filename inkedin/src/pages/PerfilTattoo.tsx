import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/perfil.css';

//Tipo
interface PortfolioItem {
  id: number;
  titulo: string;
  descricao: string;
  imagem_url: string;
  estilo: string;
  criado_em: string;
}

interface Avaliacao {
  nota: number;
  comentario: string;
  criado_em: string;
  cliente_nome: string;
}

interface Tatuador {
  id: number;
  nome: string;
  email: string;
  bio: string;
  estudio: string;
  cidade: string;
  estado: string;
  valor_minimo: number;
  valor_maximo: number;
  avaliacao_media: number;
  instagram: string | null;
  foto_perfil: string | null;
  estilos: string[];
  portfolio: PortfolioItem[];
  avaliacoes: Avaliacao[];
}

//Componente de estrelas
function Estrelas({ nota, tamanho = 'md' }: { nota: number; tamanho?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`estrelas estrelas-${tamanho}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.round(nota) ? 'estrela-cheia' : 'estrela-vazia'}>★</span>
      ))}
    </span>
  );
}

//Componente principal
export default function PerfilTattoo() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();

  const [tatuador, setTatuador]         = useState<Tatuador | null>(null);
  const [carregando, setCarregando]     = useState(true);
  const [erro, setErro]                 = useState('');
  const [fotoAmpliada, setFotoAmpliada] = useState<PortfolioItem | null>(null);
  const [abaAtiva, setAbaAtiva]         = useState<'portfolio' | 'avaliacoes'>('portfolio');

  //Busca os dados do tatuador
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const res  = await fetch(`http://localhost:3000/api/tatuadores/${id}`);
        const json = await res.json();

        if (json.success) {
          setTatuador(json.data);
        } else {
          setErro('Tatuador não encontrado.');
        }
      } catch {
        setErro('Não foi possível conectar ao servidor.');
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [id]);

  //Estados de UI
  if (carregando) {
    return (
      <div className="perfil-loading">
        <div className="spinner" />
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (erro || !tatuador) {
    return (
      <div className="perfil-erro">
        <span>😕</span>
        <p>{erro || 'Tatuador não encontrado.'}</p>
        <button onClick={() => navigate('/busca')}>Voltar para busca</button>
      </div>
    );
  }

  const precoTexto = tatuador.valor_minimo && tatuador.valor_maximo
    ? `R$ ${tatuador.valor_minimo} – R$ ${tatuador.valor_maximo}`
    : tatuador.valor_minimo
    ? `A partir de R$ ${tatuador.valor_minimo}`
    : 'Preço a consultar';

  //Render
  return (
    <div className="perfil-container">

      {/* Botão voltar */}
      <button className="perfil-voltar" onClick={() => navigate('/busca')}>
        ← Voltar
      </button>

      {/* Hero: foto + info principal */}
      <section className="perfil-hero">
        <div className="perfil-foto-wrapper">
          {tatuador.foto_perfil
            ? <img
                src={`http://localhost:3000/uploads/${tatuador.foto_perfil}`}
                alt={`Foto de ${tatuador.nome}`}
                className="perfil-foto"
              />
            : <div className="perfil-foto-placeholder">
                {tatuador.nome.charAt(0).toUpperCase()}
              </div>
          }
        </div>

        <div className="perfil-info">
          <h1 className="perfil-nome">{tatuador.nome}</h1>

          {tatuador.estudio && (
            <p className="perfil-estudio">🏠 {tatuador.estudio}</p>
          )}

          <p className="perfil-localizacao">
            📍 {tatuador.cidade}{tatuador.estado ? `, ${tatuador.estado}` : ''}
          </p>

          {/* Avaliação */}
          <div className="perfil-avaliacao">
            <Estrelas nota={tatuador.avaliacao_media} tamanho="lg" />
            <span className="perfil-avaliacao-num">
              {tatuador.avaliacao_media > 0
                ? `${tatuador.avaliacao_media.toFixed(1)} (${tatuador.avaliacoes.length} avaliações)`
                : 'Sem avaliações ainda'}
            </span>
          </div>

          {/* Preço */}
          <p className="perfil-preco">{precoTexto}</p>

          {/* Estilos */}
          {tatuador.estilos.length > 0 && (
            <div className="perfil-estilos">
              {tatuador.estilos.map(e => (
                <span key={e} className="estilo-chip">{e}</span>
              ))}
            </div>
          )}

          {/* Ações */}
          <div className="perfil-acoes">
            {tatuador.instagram && (
              <a
                href={`https://instagram.com/${tatuador.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-instagram"
              >
                📸 Instagram
              </a>
            )}
            <a
              href={`https://wa.me/?text=Olá ${tatuador.nome}, vi seu perfil no InkedIn!`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              💬 Entrar em contato
            </a>
          </div>
        </div>
      </section>

      {/* Bio */}
      {tatuador.bio && (
        <section className="perfil-bio">
          <h2>Sobre</h2>
          <p>{tatuador.bio}</p>
        </section>
      )}

      {/* Abas: Portfólio / Avaliações */}
      <div className="perfil-abas">
        <button
          className={`aba-btn ${abaAtiva === 'portfolio' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('portfolio')}
        >
          Portfólio ({tatuador.portfolio.length})
        </button>
        <button
          className={`aba-btn ${abaAtiva === 'avaliacoes' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('avaliacoes')}
        >
          Avaliações ({tatuador.avaliacoes.length})
        </button>
      </div>

      {/* Portfólio */}
      {abaAtiva === 'portfolio' && (
        <section className="perfil-portfolio">
          {tatuador.portfolio.length === 0 ? (
            <div className="perfil-vazio">
              <span>🎨</span>
              <p>Nenhum trabalho publicado ainda.</p>
            </div>
          ) : (
            <div className="portfolio-grid">
              {tatuador.portfolio.map(item => (
                <div
                  key={item.id}
                  className="portfolio-item"
                  onClick={() => setFotoAmpliada(item)}
                >
                  <img
                    src={`http://localhost:3000/uploads/${item.imagem_url}`}
                    alt={item.titulo || 'Trabalho'}
                  />
                  <div className="portfolio-overlay">
                    {item.titulo && <p className="portfolio-titulo">{item.titulo}</p>}
                    {item.estilo && <span className="portfolio-estilo">{item.estilo}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Avaliações */}
      {abaAtiva === 'avaliacoes' && (
        <section className="perfil-avaliacoes">
          {tatuador.avaliacoes.length === 0 ? (
            <div className="perfil-vazio">
              <span>⭐</span>
              <p>Nenhuma avaliação ainda.</p>
            </div>
          ) : (
            <div className="avaliacoes-lista">
              {tatuador.avaliacoes.map((av, i) => (
                <div key={i} className="avaliacao-card">
                  <div className="avaliacao-topo">
                    <span className="avaliacao-autor">{av.cliente_nome}</span>
                    <Estrelas nota={av.nota} tamanho="sm" />
                  </div>
                  {av.comentario && <p className="avaliacao-comentario">{av.comentario}</p>}
                  <span className="avaliacao-data">
                    {new Date(av.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Lightbox (foto ampliada) */}
      {fotoAmpliada && (
        <div className="lightbox" onClick={() => setFotoAmpliada(null)}>
          <div className="lightbox-conteudo" onClick={e => e.stopPropagation()}>
            <button className="lightbox-fechar" onClick={() => setFotoAmpliada(null)}>✕</button>
            <img
              src={`http://localhost:3000/uploads/${fotoAmpliada.imagem_url}`}
              alt={fotoAmpliada.titulo || 'Trabalho'}
            />
            {(fotoAmpliada.titulo || fotoAmpliada.descricao) && (
              <div className="lightbox-info">
                {fotoAmpliada.titulo && <h3>{fotoAmpliada.titulo}</h3>}
                {fotoAmpliada.descricao && <p>{fotoAmpliada.descricao}</p>}
                {fotoAmpliada.estilo && <span className="estilo-chip">{fotoAmpliada.estilo}</span>}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
