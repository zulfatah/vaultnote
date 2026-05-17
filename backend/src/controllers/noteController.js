const { validationResult } = require('express-validator');
const { prisma } = require('../config/db');
const { encrypt, decrypt } = require('../services/encryptionService');

function fail(res, code, error) {
  return res.status(code).json({ success: false, error });
}

function toPublicNote(note) {
  const decryptedText = decrypt(note);
  return {
    id: note.id,
    text: decryptedText,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

async function createNote(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const { text } = req.body;
    const encrypted = encrypt(text);

    const note = await prisma.note.create({
      data: {
        userId: req.user.id,
        encryptedText: encrypted.encryptedText,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      },
    });

    return res.status(201).json({ success: true, data: toPublicNote(note) });
  } catch (_error) {
    return fail(res, 500, 'Failed to create note.');
  }
}

async function listNotes(req, res) {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const decrypted = notes.map(toPublicNote);
    return res.json({ success: true, data: decrypted });
  } catch (_error) {
    return fail(res, 500, 'Failed to fetch notes.');
  }
}

async function searchNotes(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const query = (req.query.q || '').toString().trim().toLowerCase();
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const decrypted = notes.map(toPublicNote);

    if (!query) {
      return res.json({ success: true, data: decrypted });
    }

    const filtered = decrypted.filter((note) => note.text.toLowerCase().includes(query));
    return res.json({ success: true, data: filtered });
  } catch (_error) {
    return fail(res, 500, 'Failed to search notes.');
  }
}

async function deleteNote(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return fail(res, 400, errors.array()[0].msg);
    }

    const note = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!note) {
      return fail(res, 404, 'Note not found.');
    }

    await prisma.note.delete({ where: { id: note.id } });
    return res.json({ success: true, data: { id: note.id } });
  } catch (_error) {
    return fail(res, 500, 'Failed to delete note.');
  }
}

module.exports = { createNote, listNotes, searchNotes, deleteNote };