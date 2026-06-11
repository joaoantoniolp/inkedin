import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TattooCard from '../components/TattooCard';
import '../styles/busca.css';

//Tipos
interface Tatuador {
  id: number;
  nome: string;
  bio: string;
  cidade: string;
  estado: string;
  preco_min: number;
  preco_max: number;
  avaliacao_media: number;
  estilos: string[];
  foto_perfil: string | null;
  instagram: string | null;
}

interface Filtros {
  nome: string;
  estilo: string;
  cidade: string;
  estado: string;
  preco_max: string;
  avaliacao_min: string;
}

//Constantes
const ESTILOS = [
  'Realismo', 'Blackwork', 'Old School', 'New School',
  'Fine Line', 'Oriental', 'Tribal', 'Minimalista',
  'Geométrica', 'Aquarela', 'Trash Polka', 'Neotradicional', 'Dotwork',
];

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
];

const FILTROS_INICIAIS: Filtros = {
  nome: '', estilo: '', cidade: '', estado: '', preco_max: '', avaliacao_min: '',
};

//Componente
export default function BuscaTattoo() {
  const navigate = useNavigate();

  const [tatuadores, setTatuadores]     = useState<Tatuador[]>([]);
  const [filtros, setFiltros]           = useState<Filtros>(FILTROS_INICIAIS);
  const [carregando, setCarregando]     = useState(false);
  const [erro, setErro]                 = useState('');
  const [painelAberto, setPainelAberto] = useState(false);

  //Função de busca
  const buscar = async (f: Filtros) => {
    setCarregando(true);
    setErro('');

    const params = new URLSearchParams();
    if (f.nome)          params.append('nome',          f.nome);
    if (f.estilo)        params.append('estilo',        f.estilo);
    if (f.cidade)        params.append('cidade',        f.cidade);
    if (f.estado)        params.append('estado',        f.estado);
    if (f.preco_max)     params.append('preco_max',     f.preco_max);
    if (f.avaliacao_min) params.append('avaliacao_min', f.avaliacao_min);

    try {
      const res  = await fetch(`http://localhost:3000/api/tatuadores?${params}`);
      const json = await res.json();

      if (json.success) {
        setTatuadores(json.data);
      } else {
        setErro('Erro ao buscar tatuadores. Tente novamente.');
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // Busca inicial ao montar a página
  useEffect(() => {
    const carregarInicial = async () => {
      await buscar(FILTROS_INICIAIS);
    };
    carregarInicial();
  }, []);

  //Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    buscar(filtros);
  };

  const handleLimpar = () => {
    setFiltros(FILTROS_INICIAIS);
    buscar(FILTROS_INICIAIS);
  };

  const handleEstiloChip = (estilo: string) => {
    const novoEstilo    = filtros.estilo === estilo ? '' : estilo;
    const novosFiltros  = { ...filtros, estilo: novoEstilo };
    setFiltros(novosFiltros);
    buscar(novosFiltros);
  };

  //Render
  return (
    <div className="busca-container">

      {/* Sidebar de filtros */}
      <aside className={`busca-sidebar ${painelAberto ? 'aberto' : ''}`}>
        <div className="sidebar-header">
          <h2>Filtros</h2>
          <button className="btn-limpar" onClick={handleLimpar}>Limpar</button>
        </div>

        <form onSubmit={handleBuscar} className="filtros-form">

          {/* Nome */}
          <div className="filtro-grupo">
            <label htmlFor="nome">Nome do tatuador</label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Ex: João Silva"
              value={filtros.nome}
              onChange={handleChange}
            />
          </div>

          {/* Cidade */}
          <div className="filtro-grupo">
            <label htmlFor="cidade">Cidade</label>
            <input
              id="cidade"
              name="cidade"
              type="text"
              placeholder="Ex: São Paulo"
              value={filtros.cidade}
              onChange={handleChange}
            />
          </div>

          {/* Estado */}
          <div className="filtro-grupo">
            <label htmlFor="estado">Estado</label>
            <select id="estado" name="estado" value={filtros.estado} onChange={handleChange}>
              <option value="">Todos</option>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          {/* Preço máximo */}
          <div className="filtro-grupo">
            <label htmlFor="preco_max">
              Preço máximo: {filtros.preco_max !== '' ? `R$ ${filtros.preco_max}` : 'Qualquer'}
            </label>
            <input
              id="preco_max"
              name="preco_max"
              type="range"
              min="0"
              max="2000"
              step="50"
              value={filtros.preco_max !== '' ? filtros.preco_max : '2000'}
              onChange={handleChange}
            />
          </div>

          {/* Avaliação mínima */}
          <div className="filtro-grupo">
            <label>Avaliação mínima</label>
            <div className="estrelas-filtro">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`estrela-btn ${Number(filtros.avaliacao_min) >= n ? 'ativa' : ''}`}
                  onClick={() => {
                    const novosFiltros = {
                      ...filtros,
                      avaliacao_min: filtros.avaliacao_min === String(n) ? '' : String(n),
                    };
                    setFiltros(novosFiltros);
                    buscar(novosFiltros);
                  }}
                >★</button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-buscar">Buscar</button>
        </form>

        {/* Chips de estilo */}
        <div className="filtro-grupo">
          <label>Estilo de tatuagem</label>
          <div className="chips-container">
            {ESTILOS.map(e => (
              <button
                key={e}
                type="button"
                className={`chip ${filtros.estilo === e ? 'chip-ativo' : ''}`}
                onClick={() => handleEstiloChip(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Área principal */}
      <main className="busca-main">

        {/* Header da listagem */}
        <div className="busca-header">
          <div>
            <h1>Encontre seu tatuador</h1>
            <p className="busca-subtitulo">
              {carregando
                ? 'Buscando...'
                : `${tatuadores.length} tatuador${tatuadores.length !== 1 ? 'es' : ''} encontrado${tatuadores.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            className="btn-toggle-filtros"
            onClick={() => setPainelAberto(p => !p)}
          >
            {painelAberto ? '✕ Fechar' : '⚙ Filtros'}
          </button>
        </div>

        {/* Chip de estilo ativo */}
        {filtros.estilo && (
          <div className="filtros-ativos">
            <span className="filtro-ativo-tag">
              {filtros.estilo}
              <button onClick={() => handleEstiloChip(filtros.estilo)}>✕</button>
            </span>
          </div>
        )}

        {/* Erro */}
        {erro && <div className="busca-erro">{erro}</div>}

        {/* Skeletons de carregamento */}
        {carregando && (
          <div className="grid-tatuadores">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {/* Lista vazia */}
        {!carregando && !erro && tatuadores.length === 0 && (
          <div className="busca-vazio">
            <span>🔍</span>
            <p>Nenhum tatuador encontrado com esses filtros.</p>
            <button className="btn-limpar" onClick={handleLimpar}>Limpar filtros</button>
          </div>
        )}

        {/* Grid de cards */}
        {!carregando && tatuadores.length > 0 && (
          <div className="grid-tatuadores">
            {tatuadores.map(tatuador => (
              <TattooCard
                key={tatuador.id}
                tatuador={tatuador}
                onClick={() => navigate(`/tatuador/${tatuador.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}