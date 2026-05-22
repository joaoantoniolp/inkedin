const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./backend/database.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco conectado com sucesso.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('cliente', 'tatuador')),
      telefone TEXT,
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

  db.run(`
    CREATE TABLE IF NOT EXISTS estilos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tatuador_estilos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tatuador_id INTEGER NOT NULL,
      estilo_id INTEGER NOT NULL,
      FOREIGN KEY (tatuador_id) REFERENCES perfis_tatuadores(id),
      FOREIGN KEY (estilo_id) REFERENCES estilos(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tatuador_id INTEGER NOT NULL,
      titulo TEXT,
      descricao TEXT,
      imagem_url TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tatuador_id) REFERENCES perfis_tatuadores(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS solicitacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      tatuador_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      tamanho TEXT,
      local_corpo TEXT,
      imagem_referencia TEXT,
      data_desejada DATE,
      horario_desejado TEXT,
      status TEXT DEFAULT 'pendente'
        CHECK(status IN ('pendente', 'aceita', 'recusada', 'concluida', 'cancelada')),
      valor_estimado REAL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
      FOREIGN KEY (tatuador_id) REFERENCES perfis_tatuadores(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitacao_id INTEGER NOT NULL UNIQUE,
      cliente_id INTEGER NOT NULL,
      tatuador_id INTEGER NOT NULL,
      nota INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
      comentario TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id),
      FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
      FOREIGN KEY (tatuador_id) REFERENCES perfis_tatuadores(id)
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO estilos (nome) VALUES
    ('Old School'),
    ('Realismo'),
    ('Blackwork'),
    ('Fine Line'),
    ('Aquarela'),
    ('Minimalista'),
    ('Geométrico'),
    ('Tribal')
  `);
});

module.exports = db;