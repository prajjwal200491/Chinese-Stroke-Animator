const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // phone photos are commonly 3-8 MB
});

// Full upstream endpoint URL, e.g. http://8.152.204.166:8000/ocr. The OCR
// service is plain HTTP, so the browser can never call it directly from the
// HTTPS frontend (mixed content) -- it must go through this proxy.
const OCR_API_URL = process.env.OCR_API_URL;

router.post('/api/ocr', upload.single('file'), async (req, res) => {
  if (!OCR_API_URL) {
    return res.status(500).json({ detail: 'OCR_API_URL is not configured' });
  }
  if (!req.file) {
    return res.status(400).json({ detail: 'No image file uploaded' });
  }
  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'photo.jpg',
      contentType: req.file.mimetype,
    });
    const response = await axios.post(OCR_API_URL, form, {
      headers: form.getHeaders(),
      timeout: 60000, // the OCR model can be slow on full-page photos
      maxBodyLength: Infinity,
    });
    res.json(response.data); // { text: "..." }
  } catch (err) {
    if (err.response) {
      // Pass the upstream {detail} through: 400 "Only image files can be
      // uploaded", 500 "Model invocation failed: ..."
      return res.status(err.response.status).json(err.response.data);
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ detail: 'OCR service timed out' });
    }
    console.error('OCR proxy error:', err.message);
    res.status(502).json({ detail: 'OCR service unavailable' });
  }
});

// Multer errors (e.g. file too large) -> 400 in the same {detail} shape the
// OCR API uses, so the frontend has one error format to render.
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ detail: `Upload error: ${err.message}` });
  }
  next(err);
});

module.exports = router;
