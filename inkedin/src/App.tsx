import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import BuscaTattoo from "./pages/BuscaTattoo";
import PerfilTattoo from "./pages/PerfilTattoo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/busca" element={<BuscaTattoo />} />
        
        <Route path="/tatuador/:id" element={<PerfilTattoo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;