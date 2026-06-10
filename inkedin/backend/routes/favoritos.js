import express from 'express';
import db      from '../db.js';

const router = express.Router();

const query = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));
const queryOne = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
const run = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function(err) { err ? rej(err) : res(this); }));

// Lista todos os tatuadores favoritados por um cliente
router.get('/:cliente_id', async (req, res) => {
  const { cliente_id } = req.params;

  try {
    const favoritos = await query(`
      SELECT
        pt.id,
        u.nome,
        pt.bio,
        pt.cidade,
        pt.estado,
        pt.valor_minimo,
        pt.valor_maximo,
        pt.avaliacao_media,
        pt.foto_perfil,
        GROUP_CONCAT(e.nome, ', ') AS estilos
      FROM favoritos f
      INNER JOIN perfis_tatuadores pt ON pt.id = f.tatuador_id
      INNER JOIN usuarios u           ON u.id  = pt.usuario_id
      LEFT  JOIN tatuador_estilos te  ON te.tatuador_id = pt.id
      LEFT  JOIN estilos e            ON e.id  = te.estilo_id
      WHERE f.cliente_id = ?
      GROUP BY pt.id
      ORDER BY f.criado_em DESC
    `, [cliente_id]);

    const resultado = favoritos.map(t => ({
      ...t,
      estilos: t.estilos ? t.estilos.split(', ') : [],
    }));

    res.json({ success: true, data: resultado });
  } catch (err) {
    console.error('Erro ao buscar favoritos:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar favoritos.' });
  }
});

// Adiciona um tatuador aos favoritos
router.post('/', async (req, res) => {
  const { cliente_id, tatuador_id } = req.body;

  if (!cliente_id || !tatuador_id) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }

  try {
    await run(
      'INSERT OR IGNORE INTO favoritos (cliente_id, tatuador_id) VALUES (?, ?)',
      [cliente_id, tatuador_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao favoritar:', err);
    res.status(500).json({ success: false, message: 'Erro ao favoritar.' });
  }
});

// Remove um tatuador dos favoritos
router.delete('/', async (req, res) => {
  const { cliente_id, tatuador_id } = req.body;

  try {
    await run(
      'DELETE FROM favoritos WHERE cliente_id = ? AND tatuador_id = ?',
      [cliente_id, tatuador_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao desfavoritar:', err);
    res.status(500).json({ success: false, message: 'Erro ao desfavoritar.' });
  }
});

// Verifica se um tatuador já está nos favoritos
router.get('/check/:cliente_id/:tatuador_id', async (req, res) => {
  const { cliente_id, tatuador_id } = req.params;

  try {
    const fav = await queryOne(
      'SELECT id FROM favoritos WHERE cliente_id = ? AND tatuador_id = ?',
      [cliente_id, tatuador_id]
    );
    res.json({ success: true, favoritado: !!fav });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao verificar favorito.' });
  }
});

export default router;