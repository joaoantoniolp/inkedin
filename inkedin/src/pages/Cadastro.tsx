import { useState } from "react";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("");

  async function cadastrar() {

    console.log("clicou");

    const resposta = await fetch("http://localhost:3000/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        tipo,
      }),
    });

    const dados = await resposta.json();

    if (dados.sucesso) {

      alert("Usuário cadastrado com sucesso!");

      setNome("");
      setEmail("");
      setSenha("");
      setTipo("");
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Cadastro</h2>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <br />
      <br />

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      >
        <option value="cliente">Cliente</option>
        <option value="tatuador">Tatuador</option>
      </select>

      <br />
      <br />

      <button onClick={cadastrar}>
        Cadastrar
      </button>
    </div>
  );
}