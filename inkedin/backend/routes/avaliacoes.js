import express from 'express';
import db      from '../db.js';

const router = express.Router();

const queryOne = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row)));

const run = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function(err) { err ? rej(err) : res(this); }));

router.post('/', async (req, res) => {
  const { cliente_id, tatuador_id, nota, comentario } = req.body;

  if (!cliente_id || !tatuador_id || !nota) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }

  if (nota < 1 || nota > 5) {
    return res.status(400).json({ success: false, message: 'Nota deve ser entre 1 e 5.' });
  }

  try {
    // Verifica se já avaliou
    const existente = await queryOne(
      'SELECT id FROM avaliacoes WHERE cliente_id = ? AND tatuador_id = ?',
      [cliente_id, tatuador_id]
    );

    if (existente) {
      // Atualiza avaliação existente
      await run(
        'UPDATE avaliacoes SET nota = ?, comentario = ? WHERE cliente_id = ? AND tatuador_id = ?',
        [nota, comentario || null, cliente_id, tatuador_id]
      );
    } else {
      // Cria nova avaliação
      await run(
        'INSERT INTO avaliacoes (cliente_id, tatuador_id, nota, comentario) VALUES (?, ?, ?, ?)',
        [cliente_id, tatuador_id, nota, comentario || null]
      );
    }

    // Recalcula a média de avaliação do tatuador
    await run(`
      UPDATE perfis_tatuadores
      SET avaliacao_media = (
        SELECT ROUND(AVG(nota), 1) FROM avaliacoes WHERE tatuador_id = ?
      )
      WHERE id = ?
    `, [tatuador_id, tatuador_id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar avaliação:', err);
    res.status(500).json({ success: false, message: 'Erro ao salvar avaliação.' });
  }
});

// Verifica se o cliente já avaliou esse tatuador e retorna a avaliação
router.get('/check/:cliente_id/:tatuador_id', async (req, res) => {
  const { cliente_id, tatuador_id } = req.params;

  try {
    const avaliacao = await queryOne(
      'SELECT nota, comentario FROM avaliacoes WHERE cliente_id = ? AND tatuador_id = ?',
      [cliente_id, tatuador_id]
    );
    res.json({ success: true, avaliacao: avaliacao || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao verificar avaliação.' });
  }
});

export default router;