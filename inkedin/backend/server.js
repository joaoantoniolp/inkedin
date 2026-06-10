import express  from "express";
import cors     from "cors";
import path     from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Rotas
import tatuadoresRoutes from "./routes/tatuadores.js";
import portfolioRoutes  from "./routes/portfolio.js";

app.use("/api/tatuadores", tatuadoresRoutes);
app.use("/api/portfolio",  portfolioRoutes);

app.get("/", (req, res) => {
  res.json({ mensagem: "API InkedIn funcionando ✅" });
});

//Cadastro
app.post("/cadastro", (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: "Nome, email, senha e tipo são obrigatórios." });
  }
  if (tipo !== "cliente" && tipo !== "tatuador") {
    return res.status(400).json({ erro: "Tipo deve ser 'cliente' ou 'tatuador'." });
  }

  db.run(
    "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
    [nome, email, senha, tipo],
    function (err) {
      if (err) return res.status(500).json({ erro: "Erro ao cadastrar.", detalhes: err.message });
      res.json({ sucesso: true, id: this.lastID });
    }
  );
});

//Login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
    [email, senha],
    (err, row) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (row) {
        res.json({ sucesso: true, usuario: row });
      } else {
        res.json({ sucesso: false, mensagem: "Email ou senha incorretos." });
      }
    }
  );
});

//Criar pasta uploads se não existir
import fs from "fs";
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📁 Pasta uploads criada.");
}

//Iniciar servidor
app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});