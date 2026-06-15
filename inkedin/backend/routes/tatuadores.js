import express from 'express';
import multer  from 'multer';
import path    from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const router    = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Helpers
const query = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

const queryOne = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row)));

const run = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function(err) { err ? rej(err) : res(this); }));

//Multer para foto de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `perfil-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Formato inválido.'));
  },
});

router.get('/', async (req, res) => {
  const { nome, estilo, cidade, estado, preco_max, avaliacao_min } = req.query;

  let sql = `
    SELECT pt.id, u.nome, pt.bio, pt.estudio, pt.cidade, pt.estado,
           pt.valor_minimo, pt.valor_maximo, pt.avaliacao_media,
           pt.instagram, pt.foto_perfil,
           GROUP_CONCAT(e.nome, ', ') AS estilos
    FROM perfis_tatuadores pt
    INNER JOIN usuarios u          ON u.id = pt.usuario_id
    LEFT  JOIN tatuador_estilos te ON te.tatuador_id = pt.id
    LEFT  JOIN estilos e           ON e.id = te.estilo_id
    WHERE 1=1
  `;

  const params = [];
  if (nome)          { sql += ` AND u.nome LIKE ?`;                  params.push(`%${nome}%`); }
  if (cidade)        { sql += ` AND LOWER(pt.cidade) LIKE LOWER(?)`; params.push(`%${cidade}%`); }
  if (estado)        { sql += ` AND LOWER(pt.estado) = LOWER(?)`;    params.push(estado); }
  if (preco_max)     { sql += ` AND pt.valor_minimo <= ?`;            params.push(Number(preco_max)); }
  if (avaliacao_min) { sql += ` AND pt.avaliacao_media >= ?`;         params.push(Number(avaliacao_min)); }

  sql += ` GROUP BY pt.id`;
  if (estilo) { sql += ` HAVING estilos LIKE ?`; params.push(`%${estilo}%`); }
  sql += ` ORDER BY pt.avaliacao_media DESC`;

  try {
    const tatuadores = await query(sql, params);
    res.json({ success: true, data: tatuadores.map(t => ({
      ...t, estilos: t.estilos ? t.estilos.split(', ') : [],
    }))});
  } catch (err) {
    console.error('Erro na busca:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar tatuadores.' });
  }
});

router.get('/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const tatuador = await queryOne(`
      SELECT pt.id, u.id AS usuario_id, u.nome, u.email,
             pt.bio, pt.estudio, pt.cidade, pt.estado,
             pt.valor_minimo, pt.valor_maximo, pt.avaliacao_media,
             pt.instagram, pt.foto_perfil,
             GROUP_CONCAT(e.nome, ', ') AS estilos
      FROM perfis_tatuadores pt
      INNER JOIN usuarios u          ON u.id = pt.usuario_id
      LEFT  JOIN tatuador_estilos te ON te.tatuador_id = pt.id
      LEFT  JOIN estilos e           ON e.id = te.estilo_id
      WHERE pt.usuario_id = ?
      GROUP BY pt.id
    `, [usuario_id]);

    if (!tatuador) return res.json({ success: true, data: null });

    const portfolio = await query(`
      SELECT p.id, p.titulo, p.descricao, p.imagem_url, p.criado_em, e.nome AS estilo
      FROM portfolio p
      LEFT JOIN estilos e ON e.id = p.estilo_id
      WHERE p.tatuador_id = ?
      ORDER BY p.criado_em DESC
    `, [tatuador.id]);

    res.json({ success: true, data: {
      ...tatuador,
      estilos: tatuador.estilos ? tatuador.estilos.split(', ') : [],
      portfolio,
    }});
  } catch (err) {
    console.error('Erro dashboard:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
});

router.put('/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  const { bio, estudio, cidade, estado, valor_minimo, valor_maximo, instagram, estilos } = req.body;

  try {
    const existente = await queryOne(
      'SELECT id FROM perfis_tatuadores WHERE usuario_id = ?', [usuario_id]
    );

    let tatuadorId;

    if (existente) {
      await run(`
        UPDATE perfis_tatuadores
        SET bio=?, estudio=?, cidade=?, estado=?, valor_minimo=?, valor_maximo=?, instagram=?
        WHERE usuario_id=?
      `, [bio, estudio, cidade, estado, valor_minimo, valor_maximo, instagram, usuario_id]);
      tatuadorId = existente.id;
    } else {
      const result = await run(`
        INSERT INTO perfis_tatuadores (usuario_id, bio, estudio, cidade, estado, valor_minimo, valor_maximo, instagram)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [usuario_id, bio, estudio, cidade, estado, valor_minimo, valor_maximo, instagram]);
      tatuadorId = result.lastID;
    }

    await run('DELETE FROM tatuador_estilos WHERE tatuador_id = ?', [tatuadorId]);

    if (estilos?.length > 0) {
      for (const nomeEstilo of estilos) {
        const estiloRow = await queryOne('SELECT id FROM estilos WHERE nome = ?', [nomeEstilo]);
        if (estiloRow) {
          await run(
            'INSERT OR IGNORE INTO tatuador_estilos (tatuador_id, estilo_id) VALUES (?, ?)',
            [tatuadorId, estiloRow.id]
          );
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar perfil:', err);
    res.status(500).json({ success: false, message: 'Erro ao salvar perfil.' });
  }
});

router.post('/usuario/:usuario_id/foto', upload.single('foto'), async (req, res) => {
  const { usuario_id } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada.' });
  }

  try {
    await run(
      'UPDATE perfis_tatuadores SET foto_perfil = ? WHERE usuario_id = ?',
      [req.file.filename, usuario_id]
    );
    res.json({ success: true, foto_perfil: req.file.filename });
  } catch (err) {
    console.error('Erro ao salvar foto:', err);
    res.status(500).json({ success: false, message: 'Erro ao salvar foto de perfil.' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tatuador = await queryOne(`
      SELECT pt.id, u.nome, u.email, pt.bio, pt.estudio, pt.cidade, pt.estado,
             pt.valor_minimo, pt.valor_maximo, pt.avaliacao_media,
             pt.instagram, pt.foto_perfil,
             GROUP_CONCAT(e.nome, ', ') AS estilos
      FROM perfis_tatuadores pt
      INNER JOIN usuarios u          ON u.id = pt.usuario_id
      LEFT  JOIN tatuador_estilos te ON te.tatuador_id = pt.id
      LEFT  JOIN estilos e           ON e.id = te.estilo_id
      WHERE pt.id = ?
      GROUP BY pt.id
    `, [id]);

    if (!tatuador) {
      return res.status(404).json({ success: false, message: 'Tatuador não encontrado.' });
    }

    const portfolio = await query(`
      SELECT p.id, p.titulo, p.descricao, p.imagem_url, p.criado_em, e.nome AS estilo
      FROM portfolio p LEFT JOIN estilos e ON e.id = p.estilo_id
      WHERE p.tatuador_id = ? ORDER BY p.criado_em DESC
    `, [id]);

    const avaliacoes = await query(`
      SELECT a.nota, a.comentario, a.criado_em, u.nome AS cliente_nome
      FROM avaliacoes a
      INNER JOIN usuarios u ON u.id = a.cliente_id
      WHERE a.tatuador_id = ?
      ORDER BY a.criado_em DESC LIMIT 10
    `, [id]);

    res.json({ success: true, data: {
      ...tatuador,
      estilos: tatuador.estilos ? tatuador.estilos.split(', ') : [],
      portfolio,
      avaliacoes,
    }});
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
});

export default router;