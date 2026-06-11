import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome]         = useState('');
  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [tipo, setTipo]         = useState<'cliente' | 'tatuador'>('cliente');
  const [erro, setErro]         = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      const res  = await fetch('http://localhost:3000/cadastro', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nome, email, senha, tipo }),
      });

      const dados = await res.json();

      if (dados.sucesso) {
        // Faz login automático após cadastro
        const resLogin = await fetch('http://localhost:3000/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, senha }),
        });

        const dadosLogin = await resLogin.json();

        if (dadosLogin.sucesso) {
          localStorage.setItem('usuario', JSON.stringify(dadosLogin.usuario));
          navigate(tipo === 'tatuador' ? '/dashboard-tattoo' : '/dashboard-cliente');
        } else {
          navigate('/login');
        }
      } else {
        setErro(dados.erro || 'Erro ao cadastrar. Tente novamente.');
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

        <h1 className="auth-titulo">Criar conta</h1>
        <p className="auth-subtitulo">Junte-se à maior plataforma de tatuagem</p>

        {/* Seletor de tipo */}
        <div className="tipo-selector">
          <button
            type="button"
            className={`tipo-btn ${tipo === 'cliente' ? 'ativo' : ''}`}
            onClick={() => setTipo('cliente')}
          >
            🙋 Sou cliente
          </button>
          <button
            type="button"
            className={`tipo-btn ${tipo === 'tatuador' ? 'ativo' : ''}`}
            onClick={() => setTipo('tatuador')}
          >
            🎨 Sou tatuador
          </button>
        </div>

        <form className="auth-form" onSubmit={handleCadastro}>

          <div className="auth-grupo">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              autoComplete="name"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {erro && <p className="auth-erro">{erro}</p>}

          <button type="submit" className="auth-btn" disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-rodape">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">Entrar</Link>
        </p>
      </div>
    </div>
  );
}