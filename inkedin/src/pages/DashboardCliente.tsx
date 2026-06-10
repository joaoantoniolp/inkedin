import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard-cliente.css';

//Tipos
interface Tatuador {
  id: number;
  nome: string;
  bio: string;
  cidade: string;
  estado: string;
  valor_minimo: number;
  valor_maximo: number;
  avaliacao_media: number;
  estilos: string[];
  foto_perfil: string | null;
}

//Componente principal
export default function DashboardCliente() {
  const navigate = useNavigate();
  const usuario  = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [favoritos, setFavoritos]     = useState<Tatuador[]>([]);
  const [carregando, setCarregando]   = useState(true);
  const [removendo, setRemovedendo]   = useState<number | null>(null);

  //Carrega favoritos
  useEffect(() => {
    const carregar = async () => {
      try {
        const res  = await fetch(`http://localhost:3000/api/favoritos/${usuario.id}`);
        const json = await res.json();
        if (json.success) setFavoritos(json.data);
      } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
      } finally {
        setCarregando(false);
      }
    };

    if (usuario.id) carregar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Remover favorito
  const handleRemoverFavorito = async (tatuadorId: number) => {
    setRemovedendo(tatuadorId);
    try {
      const res  = await fetch(`http://localhost:3000/api/favoritos`, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cliente_id: usuario.id, tatuador_id: tatuadorId }),
      });
      const json = await res.json();
      if (json.success) {
        setFavoritos(prev => prev.filter(t => t.id !== tatuadorId));
      }
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
    } finally {
      setRemovedendo(null);
    }
  };

  //Render
  return (
    <div className="dashc-container">

      {/* Header */}
      <div className="dashc-header">
        <div>
          <h1>Olá, {usuario.nome} 👋</h1>
          <p>Seus tatuadores favoritos</p>
        </div>
        <button className="btn-buscar-mais" onClick={() => navigate('/busca')}>
          + Descobrir tatuadores
        </button>
      </div>

      {/* Lista de favoritos */}
      {carregando ? (
        <div className="dashc-loading">
          <div className="spinner" />
          <p>Carregando favoritos...</p>
        </div>
      ) : favoritos.length === 0 ? (
        <div className="dashc-vazio">
          <span>🤍</span>
          <p>Você ainda não favoritou nenhum tatuador.</p>
          <button onClick={() => navigate('/busca')}>Explorar tatuadores</button>
        </div>
      ) : (
        <>
          <p className="dashc-contador">
            {favoritos.length} tatuador{favoritos.length !== 1 ? 'es' : ''} salvo{favoritos.length !== 1 ? 's' : ''}
          </p>
          <div className="dashc-grid">
            {favoritos.map(tatuador => {
              const preco = tatuador.valor_minimo && tatuador.valor_maximo
                ? `R$ ${tatuador.valor_minimo} – R$ ${tatuador.valor_maximo}`
                : tatuador.valor_minimo
                ? `A partir de R$ ${tatuador.valor_minimo}`
                : 'Preço a consultar';

              const estrelas = Array.from({ length: 5 }, (_, i) =>
                i < Math.round(tatuador.avaliacao_media) ? '★' : '☆'
              ).join('');

              return (
                <div key={tatuador.id} className="dashc-card">
                  {/* Foto */}
                  <div
                    className="dashc-card-foto"
                    onClick={() => navigate(`/tatuador/${tatuador.id}`)}
                  >
                    {tatuador.foto_perfil
                      ? <img
                          src={`http://localhost:3000/uploads/${tatuador.foto_perfil}`}
                          alt={tatuador.nome}
                        />
                      : <div className="dashc-foto-placeholder">
                          {tatuador.nome.charAt(0).toUpperCase()}
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="dashc-card-info">
                    <div className="dashc-card-topo">
                      <h3
                        className="dashc-card-nome"
                        onClick={() => navigate(`/tatuador/${tatuador.id}`)}
                      >
                        {tatuador.nome}
                      </h3>
                      <button
                        className={`btn-desfavoritar ${removendo === tatuador.id ? 'removendo' : ''}`}
                        onClick={() => handleRemoverFavorito(tatuador.id)}
                        title="Remover dos favoritos"
                        disabled={removendo === tatuador.id}
                      >
                        ♥
                      </button>
                    </div>

                    <p className="dashc-localizacao">
                      📍 {tatuador.cidade}{tatuador.estado ? `, ${tatuador.estado}` : ''}
                    </p>

                    <div className="dashc-avaliacao">
                      <span className="estrelas">{estrelas}</span>
                      <span className="dashc-avaliacao-num">
                        {tatuador.avaliacao_media > 0
                          ? tatuador.avaliacao_media.toFixed(1)
                          : 'Novo'}
                      </span>
                    </div>

                    {tatuador.estilos?.length > 0 && (
                      <div className="dashc-estilos">
                        {tatuador.estilos.slice(0, 3).map(e => (
                          <span key={e} className="estilo-chip">{e}</span>
                        ))}
                        {tatuador.estilos.length > 3 && (
                          <span className="estilo-chip estilo-chip-mais">
                            +{tatuador.estilos.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="dashc-card-rodape">
                      <span className="dashc-preco">{preco}</span>
                      <button
                        className="btn-ver-perfil"
                        onClick={() => navigate(`/tatuador/${tatuador.id}`)}
                      >
                        Ver perfil →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}