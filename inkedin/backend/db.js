import sqlite3   from "sqlite3";
import path      from "path";
import { fileURLToPath } from "url";
 
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
 
const Database = sqlite3.verbose().Database;
 
const db = new Database(path.join(__dirname, "database.db"), (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("✅ Banco conectado com sucesso.");
  }
});
 
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
 
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE,
      senha     TEXT    NOT NULL,
      tipo      TEXT    NOT NULL CHECK(tipo IN ('cliente', 'tatuador')),
      telefone  TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
 
  db.run(`
    CREATE TABLE IF NOT EXISTS perfis_tatuadores (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id      INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
      bio             TEXT,
      estudio         TEXT,
      cidade          TEXT,
      estado          TEXT,
      sexo            TEXT CHECK(sexo IN ('M', 'F', 'Outro')),
      valor_minimo    REAL    DEFAULT 0,
      valor_maximo    REAL    DEFAULT 0,
      avaliacao_media REAL    DEFAULT 0,
      instagram       TEXT,
      foto_perfil     TEXT,
      disponibilidade TEXT
    )
  `);
 
  db.run(`
    CREATE TABLE IF NOT EXISTS estilos (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    )
  `);
 
  db.run(`
    CREATE TABLE IF NOT EXISTS tatuador_estilos (
      tatuador_id INTEGER NOT NULL REFERENCES perfis_tatuadores(id) ON DELETE CASCADE,
      estilo_id   INTEGER NOT NULL REFERENCES estilos(id)           ON DELETE CASCADE,
      PRIMARY KEY (tatuador_id, estilo_id)
    )
  `);
 
  db.run(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tatuador_id INTEGER NOT NULL REFERENCES perfis_tatuadores(id) ON DELETE CASCADE,
      titulo      TEXT,
      descricao   TEXT,
      imagem_url  TEXT    NOT NULL,
      estilo_id   INTEGER REFERENCES estilos(id),
      criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
 
  db.run(`
    CREATE TABLE IF NOT EXISTS favoritos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id  INTEGER NOT NULL REFERENCES usuarios(id)          ON DELETE CASCADE,
      tatuador_id INTEGER NOT NULL REFERENCES perfis_tatuadores(id) ON DELETE CASCADE,
      criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(cliente_id, tatuador_id)
    )
  `);
 
  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id  INTEGER NOT NULL REFERENCES usuarios(id)          ON DELETE CASCADE,
      tatuador_id INTEGER NOT NULL REFERENCES perfis_tatuadores(id) ON DELETE CASCADE,
      nota        INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
      comentario  TEXT,
      criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(cliente_id, tatuador_id)
    )
  `);
 
  db.run(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      remetente_id    INTEGER NOT NULL REFERENCES usuarios(id),
      destinatario_id INTEGER NOT NULL REFERENCES usuarios(id),
      conteudo        TEXT    NOT NULL,
      enviado_em      DATETIME DEFAULT CURRENT_TIMESTAMP,
      lida            INTEGER  DEFAULT 0 CHECK(lida IN (0, 1))
    )
  `);
 
  db.run(`
    INSERT OR IGNORE INTO estilos (nome) VALUES
      ('Old School'), ('Realismo'),    ('Blackwork'),
      ('Fine Line'),  ('Aquarela'),    ('Minimalista'),
      ('Geométrico'), ('Tribal'),      ('New School'),
      ('Oriental'),   ('Trash Polka'), ('Neotradicional'),
      ('Dotwork')
  `);
});
 
export default db;