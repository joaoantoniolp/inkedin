import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <h1 className="logo" onClick={() => navigate("/")}>
        InkedIn
      </h1>

      <div>
        <button
          className="btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <button
          className="btn primary"
          onClick={() => navigate("/cadastro")}
        >
          Cadastrar
        </button>
      </div>
    </nav>
  );
}