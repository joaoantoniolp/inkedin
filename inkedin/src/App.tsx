import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home             from './pages/Home';
import Login            from './pages/Login';
import Cadastro         from './pages/Cadastro';
import BuscaTattoo      from './pages/BuscaTattoo';
import PerfilTattoo     from './pages/PerfilTattoo';
import DashboardTattoo  from './pages/DashboardTattoo';
import DashboardCliente from './pages/DashboardCliente';

// Rota por tipo de usuário
// Redireciona para /login se não logado, ou para home se for o tipo errado
function RotaTipo({ tipo, children }: { tipo: 'cliente' | 'tatuador'; children: React.ReactNode }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.tipo !== tipo) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// App 
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* Públicas */}
        <Route path="/"        element={<Home />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/busca"   element={<BuscaTattoo />} />
        <Route path="/tatuador/:id" element={<PerfilTattoo />} />

        {/* Apenas para tatuadores */}
        <Route
          path="/dashboard-tattoo"
          element={
            <RotaTipo tipo="tatuador">
              <DashboardTattoo />
            </RotaTipo>
          }
        />

        {/* Apenas para clientes */}
        <Route
          path="/dashboard-cliente"
          element={
            <RotaTipo tipo="cliente">
              <DashboardCliente />
            </RotaTipo>
          }
        />

        {/* Rota curinga — redireciona para home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
