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

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});