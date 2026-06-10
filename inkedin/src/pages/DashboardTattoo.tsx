import { useState, useEffect, useRef } from 'react';
import '../styles/dashboard-tattoo.css';

//Tipos
interface Perfil {
  id: number;
  usuario_id: number;
  nome: string;
  email: string;
  bio: string;
  estudio: string;
  cidade: string;
  estado: string;
  valor_minimo: number;
  valor_maximo: number;
  instagram: string;
  foto_perfil: string | null;
  estilos: string[];
}

interface PortfolioItem {
  id: number;
  titulo: string;
  descricao: string;
  imagem_url: string;
  estilo: string;
  criado_em: string;
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

//Componente principal
export default function DashboardTattoo() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [abaAtiva, setAbaAtiva]       = useState<'perfil' | 'portfolio'>('perfil');
  const [perfil, setPerfil]           = useState<Perfil | null>(null);
  const [portfolio, setPortfolio]     = useState<PortfolioItem[]>([]);
  const [carregando, setCarregando]   = useState(true);
  const [salvando, setSalvando]       = useState(false);
  const [mensagem, setMensagem]       = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  //Campos do formulário de perfil
  const [form, setForm] = useState({
    bio: '', estudio: '', cidade: '', estado: '',
    valor_minimo: '', valor_maximo: '', instagram: '',
  });
  const [estilosSelecionados, setEstilosSelecionados] = useState<string[]>([]);

  //Upload de portfólio
  const [uploadForm, setUploadForm]   = useState({ titulo: '', descricao: '', estilo: '' });
  const [imagemSelecionada, setImagemSelecionada] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [enviando, setEnviando]       = useState(false);
  const inputFileRef                  = useRef<HTMLInputElement>(null);

  //Carrega perfil e portfólio
  useEffect(() => {
    const carregar = async () => {
      try {
        //Busca o perfil do tatuador logado
        const res  = await fetch(`http://localhost:3000/api/tatuadores/usuario/${usuario.id}`);
        const json = await res.json();

        if (json.success && json.data) {
          const p = json.data;
          setPerfil(p);
          setForm({
            bio:          p.bio          || '',
            estudio:      p.estudio      || '',
            cidade:       p.cidade       || '',
            estado:       p.estado       || '',
            valor_minimo: p.valor_minimo ? String(p.valor_minimo) : '',
            valor_maximo: p.valor_maximo ? String(p.valor_maximo) : '',
            instagram:    p.instagram    || '',
          });
          setEstilosSelecionados(p.estilos || []);
          setPortfolio(p.portfolio || []);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setCarregando(false);
      }
    };

    if (usuario.id) carregar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Mostrar mensagem temporária
  const mostrarMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 3500);
  };

  //Salvar perfil
  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const res = await fetch(`http://localhost:3000/api/tatuadores/usuario/${usuario.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          valor_minimo: Number(form.valor_minimo) || 0,
          valor_maximo: Number(form.valor_maximo) || 0,
          estilos: estilosSelecionados,
        }),
      });

      const json = await res.json();

      if (json.success) {
        mostrarMensagem('sucesso', 'Perfil atualizado com sucesso!');
      } else {
        mostrarMensagem('erro', json.message || 'Erro ao salvar perfil.');
      }
    } catch {
      mostrarMensagem('erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setSalvando(false);
    }
  };

  //Toggle de estilo
  const toggleEstilo = (estilo: string) => {
    setEstilosSelecionados(prev =>
      prev.includes(estilo) ? prev.filter(e => e !== estilo) : [...prev, estilo]
    );
  };

  //Preview de imagem
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    //Valida tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      mostrarMensagem('erro', 'Imagem muito grande. Máximo 5MB.');
      return;
    }

    setImagemSelecionada(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  //Upload de foto do portfólio
  const handleUploadPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagemSelecionada) {
      mostrarMensagem('erro', 'Selecione uma imagem.');
      return;
    }

    setEnviando(true);

    const formData = new FormData();
    formData.append('imagem',    imagemSelecionada);
    formData.append('titulo',    uploadForm.titulo);
    formData.append('descricao', uploadForm.descricao);
    formData.append('estilo',    uploadForm.estilo);
    formData.append('usuario_id', String(usuario.id));

    try {
      const res  = await fetch('http://localhost:3000/api/portfolio', {
        method: 'POST',
        body:   formData,
      });
      const json = await res.json();

      if (json.success) {
        mostrarMensagem('sucesso', 'Foto adicionada ao portfólio!');
        setPortfolio(prev => [json.data, ...prev]);
        // Limpa o formulário
        setUploadForm({ titulo: '', descricao: '', estilo: '' });
        setImagemSelecionada(null);
        setPreviewUrl(null);
        if (inputFileRef.current) inputFileRef.current.value = '';
      } else {
        mostrarMensagem('erro', json.message || 'Erro ao enviar foto.');
      }
    } catch {
      mostrarMensagem('erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setEnviando(false);
    }
  };

  //Excluir item do portfólio
  const handleExcluirPortfolio = async (portfolioId: number) => {
    if (!confirm('Excluir esta foto do portfólio?')) return;

    try {
      const res  = await fetch(`http://localhost:3000/api/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setPortfolio(prev => prev.filter(p => p.id !== portfolioId));
        mostrarMensagem('sucesso', 'Foto removida.');
      } else {
        mostrarMensagem('erro', 'Erro ao remover foto.');
      }
    } catch {
      mostrarMensagem('erro', 'Não foi possível conectar ao servidor.');
    }
  };

  //Loading
  if (carregando) {
    return (
      <div className="dash-loading">
        <div className="spinner" />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  //Render
  return (
    <div className="dash-container">

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`dash-mensagem dash-mensagem-${mensagem.tipo}`}>
          {mensagem.tipo === 'sucesso' ? '✓' : '✕'} {mensagem.texto}
        </div>
      )}

      {/* Header do dashboard */}
      <div className="dash-header">
        <div>
          <h1>Olá, {usuario.nome} 👋</h1>
          <p>Gerencie seu perfil e portfólio</p>
        </div>
        <div className="dash-foto-mini">
          {perfil?.foto_perfil
            ? <img src={`http://localhost:3000/uploads/${perfil.foto_perfil}`} alt="Foto" />
            : <span>{usuario.nome?.charAt(0).toUpperCase()}</span>
          }
        </div>
      </div>

      {/* Abas */}
      <div className="dash-abas">
        <button
          className={`aba-btn ${abaAtiva === 'perfil' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('perfil')}
        >
          ✏️ Meu Perfil
        </button>
        <button
          className={`aba-btn ${abaAtiva === 'portfolio' ? 'ativa' : ''}`}
          onClick={() => setAbaAtiva('portfolio')}
        >
          🎨 Portfólio ({portfolio.length})
        </button>
      </div>

      {/* ABA: PERFIL */}
      
      {abaAtiva === 'perfil' && (
        <form className="dash-form" onSubmit={handleSalvarPerfil}>

          <div className="form-secao">
            <h2>Informações profissionais</h2>

            <div className="form-grupo">
              <label>Bio / Apresentação</label>
              <textarea
                placeholder="Fale sobre você, sua experiência, seu estilo..."
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="form-grupo">
              <label>Nome do estúdio</label>
              <input
                type="text"
                placeholder="Ex: Black Ink Studio"
                value={form.estudio}
                onChange={e => setForm(p => ({ ...p, estudio: e.target.value }))}
              />
            </div>

            <div className="form-linha">
              <div className="form-grupo">
                <label>Cidade</label>
                <input
                  type="text"
                  placeholder="Ex: Goiânia"
                  value={form.cidade}
                  onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))}
                />
              </div>
              <div className="form-grupo">
                <label>Estado</label>
                <select
                  value={form.estado}
                  onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            <div className="form-linha">
              <div className="form-grupo">
                <label>Valor mínimo (R$)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 150"
                  value={form.valor_minimo}
                  onChange={e => setForm(p => ({ ...p, valor_minimo: e.target.value }))}
                />
              </div>
              <div className="form-grupo">
                <label>Valor máximo (R$)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 800"
                  value={form.valor_maximo}
                  onChange={e => setForm(p => ({ ...p, valor_maximo: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-grupo">
              <label>Instagram</label>
              <input
                type="text"
                placeholder="@seuusuario"
                value={form.instagram}
                onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
              />
            </div>
          </div>

          {/* Estilos */}
          <div className="form-secao">
            <h2>Estilos que você trabalha</h2>
            <p className="form-dica">Selecione todos os estilos que você domina</p>
            <div className="chips-container">
              {ESTILOS.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`chip ${estilosSelecionados.includes(e) ? 'chip-ativo' : ''}`}
                  onClick={() => toggleEstilo(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-salvar" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      )}

      {/* ABA: PORTFÓLIO */}
      
      {abaAtiva === 'portfolio' && (
        <div className="dash-portfolio">

          {/* Formulário de upload */}
          <div className="upload-card">
            <h2>Adicionar foto ao portfólio</h2>

            <form onSubmit={handleUploadPortfolio} className="upload-form">

              {/* Área de upload */}
              <div
                className={`upload-area ${previewUrl ? 'tem-preview' : ''}`}
                onClick={() => inputFileRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="upload-preview" />
                ) : (
                  <>
                    <span className="upload-icone">📷</span>
                    <p>Clique para selecionar uma foto</p>
                    <small>JPG, PNG ou WEBP — máx. 5MB</small>
                  </>
                )}
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagemChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-grupo">
                <label>Título (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Dragão em blackwork"
                  value={uploadForm.titulo}
                  onChange={e => setUploadForm(p => ({ ...p, titulo: e.target.value }))}
                />
              </div>

              <div className="form-grupo">
                <label>Estilo</label>
                <select
                  value={uploadForm.estilo}
                  onChange={e => setUploadForm(p => ({ ...p, estilo: e.target.value }))}
                >
                  <option value="">Selecione o estilo</option>
                  {ESTILOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div className="form-grupo">
                <label>Descrição (opcional)</label>
                <textarea
                  placeholder="Conte sobre esse trabalho..."
                  value={uploadForm.descricao}
                  onChange={e => setUploadForm(p => ({ ...p, descricao: e.target.value }))}
                  rows={2}
                />
              </div>

              <button type="submit" className="btn-upload" disabled={enviando || !imagemSelecionada}>
                {enviando ? 'Enviando...' : '+ Adicionar ao portfólio'}
              </button>
            </form>
          </div>

          {/* Grid do portfólio */}
          {portfolio.length === 0 ? (
            <div className="dash-vazio">
              <span>🎨</span>
              <p>Seu portfólio está vazio. Adicione seu primeiro trabalho!</p>
            </div>
          ) : (
            <div className="portfolio-grid">
              {portfolio.map(item => (
                <div key={item.id} className="portfolio-item">
                  <img
                    src={`http://localhost:3000/uploads/${item.imagem_url}`}
                    alt={item.titulo || 'Trabalho'}
                  />
                  <div className="portfolio-overlay">
                    {item.titulo && <p className="portfolio-titulo">{item.titulo}</p>}
                    {item.estilo && <span className="portfolio-estilo">{item.estilo}</span>}
                    <button
                      className="btn-excluir"
                      onClick={() => handleExcluirPortfolio(item.id)}
                    >
                      🗑 Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}