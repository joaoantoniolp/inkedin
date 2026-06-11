import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
    window.location.reload();
  };

  const handleDashboard = () => {
    if (usuario.tipo === 'tatuador') {
      navigate('/dashboard-tattoo');
    } else {
      navigate('/dashboard-cliente');
    }
  };

  const isAtiva = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Logo */}
      <span className="navbar-logo" onClick={() => navigate('/')}>
        Inked<span>In</span>
      </span>

      {/* Links centrais */}
      <div className="navbar-links">
        <button
          className={`navbar-link ${isAtiva('/') ? 'ativo' : ''}`}
          onClick={() => navigate('/')}
        >
          Início
        </button>
        <button
          className={`navbar-link ${isAtiva('/busca') ? 'ativo' : ''}`}
          onClick={() => navigate('/busca')}
        >
          Buscar tatuadores
        </button>
      </div>

      {/* Ações à direita */}
      <div className="navbar-acoes">
        {usuario ? (
          <>
            <button className="navbar-link" onClick={handleDashboard}>
              {usuario.tipo === 'tatuador' ? '🎨 Meu perfil' : '🤍 Favoritos'}
            </button>
            <div className="navbar-usuario">
              <span className="navbar-avatar">
                {usuario.nome.charAt(0).toUpperCase()}
              </span>
              <span className="navbar-nome">{usuario.nome.split(' ')[0]}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <button className="btn-nav-outline" onClick={() => navigate('/login')}>
              Entrar
            </button>
            <button className="btn-nav-primary" onClick={() => navigate('/cadastro')}>
              Cadastrar
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
