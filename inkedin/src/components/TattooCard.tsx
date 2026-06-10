import '../styles/tattoocard.css';

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
}

interface Props {
  tatuador: Tatuador;
  onClick: () => void;
}

export default function TattooCard({ tatuador, onClick }: Props) {
  const { nome, bio, cidade, estado, preco_min, preco_max, avaliacao_media, estilos, foto_perfil } = tatuador;

  // Gera as estrelas de avaliação (ex: 3.7 → ★★★★☆)
  const estrelas = Array.from({ length: 5 }, (_, i) => i < Math.round(avaliacao_media) ? '★' : '☆').join('');

  // Formata o range de preço
  const precoTexto = preco_min && preco_max
    ? `R$ ${preco_min} – R$ ${preco_max}`
    : preco_min ? `A partir de R$ ${preco_min}` : 'Preço a consultar';

  // Limita bio a 90 caracteres
  const bioResumida = bio && bio.length > 90 ? bio.slice(0, 90) + '…' : bio;

  return (
    <article className="tattoo-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}>

      {/* Foto de perfil */}
      <div className="card-foto">
        {foto_perfil
          ? <img src={`http://localhost:3000/uploads/${foto_perfil}`} alt={`Foto de ${nome}`} />
          : <div className="card-foto-placeholder">{nome.charAt(0).toUpperCase()}</div>
        }
      </div>

      {/* Conteúdo */}
      <div className="card-corpo">
        <div className="card-topo">
          <h3 className="card-nome">{nome}</h3>
          <span className="card-avaliacao" title={`${avaliacao_media} de 5`}>
            {estrelas} <small>{avaliacao_media > 0 ? avaliacao_media.toFixed(1) : 'Novo'}</small>
          </span>
        </div>

        <p className="card-localizacao">📍 {cidade}{estado ? `, ${estado}` : ''}</p>

        {bioResumida && <p className="card-bio">{bioResumida}</p>}

        {/* Estilos como chips */}
        {estilos.length > 0 && (
          <div className="card-estilos">
            {estilos.slice(0, 3).map(e => (
              <span key={e} className="estilo-chip">{e}</span>
            ))}
            {estilos.length > 3 && (
              <span className="estilo-chip estilo-chip-mais">+{estilos.length - 3}</span>
            )}
          </div>
        )}

        <p className="card-preco">{precoTexto}</p>
      </div>
    </article>
  );
}
