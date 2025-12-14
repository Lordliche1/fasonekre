const express = require('express');
const router = express.Router();
const GeminiService = require('../services/geminiService');
const auth = require('../middleware/authentication');
const upload = require('../middleware/upload');
const Complaint = require('../models/Complaint');
const fs = require('fs').promises;

// Initialiser le service Gemini
const gemini = new GeminiService(process.env.GEMINI_API_KEY);

// Analyser une plainte textuelle
router.post('/analyze-complaint', auth, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Texte requis' });
        }

        const analysis = await gemini.analyzeComplaint(text);

        if (analysis.error) {
            return res.status(500).json({ error: analysis.error });
        }

        res.json({ success: true, analysis });
    } catch (error) {
        console.error('Erreur analyse plainte:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analyser une image
router.post('/analyze-image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image requise' });
        }

        const imageBuffer = await fs.readFile(req.file.path);
        const mimeType = req.file.mimetype;

        const analysis = await gemini.analyzeImage(imageBuffer, mimeType);

        if (analysis.error) {
            return res.status(500).json({ error: analysis.error });
        }

        res.json({
            success: true,
            analysis,
            imageUrl: `/uploads/images/${req.file.filename}`
        });
    } catch (error) {
        console.error('Erreur analyse image:', error);
        res.status(500).json({ error: error.message });
    }
});

// Monitoring des tendances
router.get('/trends', auth, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(100);

        if (complaints.length === 0) {
            return res.json({
                success: true,
                message: 'Pas assez de données pour l\'analyse',
                analysis: {
                    trends: [],
                    anomalies: [],
                    recommendations: [],
                    alerts: []
                }
            });
        }

        const analysis = await gemini.analyzeComplaintsTrend(complaints);

        if (analysis.error) {
            return res.status(500).json({ error: analysis.error });
        }

        res.json({ success: true, analysis });
    } catch (error) {
        console.error('Erreur analyse trends:', error);
        res.status(500).json({ error: error.message });
    }
});

// Chat assistant
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message requis' });
        }

        const response = await gemini.chatAssistant(message, context || {});

        res.json({ success: true, response });
    } catch (error) {
        console.error('Erreur chat:', error);
        res.status(500).json({ error: error.message });
    }
});

// Vérifier le statut du service Gemini
router.get('/status', auth, (req, res) => {
    res.json({
        success: true,
        enabled: gemini.enabled,
        message: gemini.enabled ? 'Service Gemini actif' : 'Service Gemini désactivé - Configurez GEMINI_API_KEY'
    });
});

module.exports = router;
