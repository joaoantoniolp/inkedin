import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [erro, setErro]         = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      const res  = await fetch('http://localhost:3000/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, senha }),
      });

      const dados = await res.json();

      if (dados.sucesso) {
        // Salva o usuário no localStorage
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        // Redireciona para o dashboard correto
        if (dados.usuario.tipo === 'tatuador') {
          navigate('/dashboard-tattoo');
        } else {
          navigate('/dashboard-cliente');
        }
      } else {
        setErro('Email ou senha incorretos.');
      }
    } catch {
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo" onClick={() => navigate('/')}>
          Inked<span>In</span>
        </div>

        <h1 className="auth-titulo">Bem-vindo de volta</h1>
        <p className="auth-subtitulo">Entre na sua conta para continuar</p>

        <form className="auth-form" onSubmit={handleLogin}>

          <div className="auth-grupo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-grupo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="auth-btn" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-rodape">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="auth-link">Cadastre-se grátis</Link>
        </p>
      </div>
    </div>
  );
}