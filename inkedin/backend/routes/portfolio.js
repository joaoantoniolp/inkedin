import express  from 'express';
import multer   from 'multer';
import path     from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

const router    = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração do Multer (upload de imagens)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Nome único: timestamp + nome original sem espaços
    const ext      = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato não permitido. Use JPG, PNG ou WEBP.'));
    }
  },
});

// Helpers promise
const query    = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));
const queryOne = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
const run      = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function(err) { err ? rej(err) : res(this); }));

// Faz upload de uma foto para o portfólio do tatuador
router.post('/', upload.single('imagem'), async (req, res) => {
  const { usuario_id, titulo, descricao, estilo } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada.' });
  }

  try {
    // Busca o perfil do tatuador pelo usuario_id
    const perfil = await queryOne(
      'SELECT id FROM perfis_tatuadores WHERE usuario_id = ?', [usuario_id]
    );

    if (!perfil) {
      return res.status(404).json({ success: false, message: 'Perfil de tatuador não encontrado.' });
    }

    // Busca o id do estilo pelo nome
    let estiloId = null;
    if (estilo) {
      const estiloRow = await queryOne('SELECT id FROM estilos WHERE nome = ?', [estilo]);
      estiloId = estiloRow?.id || null;
    }

    // Insere no banco
    const result = await run(
      `INSERT INTO portfolio (tatuador_id, titulo, descricao, imagem_url, estilo_id)
       VALUES (?, ?, ?, ?, ?)`,
      [perfil.id, titulo || null, descricao || null, req.file.filename, estiloId]
    );

    res.json({
      success: true,
      data: {
        id:         result.lastID,
        titulo:     titulo     || '',
        descricao:  descricao  || '',
        imagem_url: req.file.filename,
        estilo:     estilo     || '',
        criado_em:  new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ success: false, message: 'Erro ao salvar no banco.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await run('DELETE FROM portfolio WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao excluir:', err);
    res.status(500).json({ success: false, message: 'Erro ao excluir.' });
  }
});

export default router;