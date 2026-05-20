import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./backend/database.db");

db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    senha TEXT
)
`);

app.get("/", (req, res) => {
    res.send("API funcionando");
});

app.post("/cadastro", (req, res) => {
    const { nome, email, senha } = req.body;

    db.run(
        "INSERT INTO usuarios(nome, email, senha) VALUES (?, ?, ?)",
        [nome, email, senha],
        function(err) {
            if (err) {
                return res.status(500).json(err);
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