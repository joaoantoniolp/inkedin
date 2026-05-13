export default function Cadastro() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Cadastro</h2>

      <input placeholder="Nome" /><br /><br />

      <input placeholder="Email" /><br /><br />

      <input placeholder="Senha" type="password" /><br /><br />

      <button>Cadastrar</button>
    </div>
  );
}