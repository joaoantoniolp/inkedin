import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./backend/database.db");

db.serialize(() => {
db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('cliente', 'tatuador')),
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS perfis_tatuadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE,
      bio TEXT,
      estudio TEXT,
      cidade TEXT,
      valor_minimo REAL,
      valor_maximo REAL,
      instagram TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
});

app.get("/", (req, res) => {
    res.send("API funcionando");
});

app.post("/cadastro", (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({
      erro: "Nome, email, senha e tipo são obrigatórios."
    });
  }

  if (tipo !== "cliente" && tipo !== "tatuador") {
    return res.status(400).json({
      erro: "Tipo deve ser cliente ou tatuador."
    });
  }

    db.run(
    "INSERT INTO usuarios(nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
    [nome, email, senha, tipo],
    function (err) {
            if (err) {
        return res.status(500).json({
          erro: "Erro ao cadastrar usuário.",
          detalhes: err.message
        });
            }

            res.json({
                sucesso: true,
                id: this.lastID
            });
        }
    );
});

app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    db.get(
        "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
        [email, senha],
        (err, row) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (row) {
                res.json({
                    sucesso: true,
                    usuario: row
                });
            } else {
                res.json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado"
                });
            }
        }
    );
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});