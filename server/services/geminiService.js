const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            console.warn('⚠️  GEMINI_API_KEY non configurée - Les fonctionnalités IA seront désactivées');
            this.enabled = false;
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.enabled = true;
    }

    // Analyser une plainte textuelle
    async analyzeComplaint(text) {
        if (!this.enabled) {
            return { error: 'Service Gemini non configuré' };
        }

        try {
            const prompt = `
Analyse cette plainte citoyenne et fournis une réponse JSON structurée :

Plainte : "${text}"

Fournis :
1. category : catégorie (Voirie, Assainissement, Éclairage Public, Espaces Verts, Santé, Éducation, Transport, Autre)
2. urgency : niveau d'urgence (low, medium, high, critical)
3. department : département recommandé
4. summary : résumé en 1 phrase
5. keywords : mots-clés principaux (array de 3-5 mots)
6. sentiment : sentiment (positive, neutral, negative)

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parser le JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Impossible de parser la réponse');
        } catch (error) {
            console.error('Erreur analyse Gemini:', error);
            return { error: error.message };
        }
    }

    // Analyser une image
    async analyzeImage(imageBuffer, mimeType) {
        if (!this.enabled) {
            return { error: 'Service Gemini non configuré' };
        }

        try {
            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType
                }
            };

            const prompt = `
Analyse cette image d'un problème municipal et fournis une réponse JSON :

Identifie :
1. problemType : type de problème visible (ex: nid-de-poule, déchets, éclairage défectueux, etc.)
2. severity : gravité (minor, moderate, severe, critical)
3. description : description détaillée en français
4. suggestedDepartment : département compétent (Voirie, Assainissement, Éclairage Public, Espaces Verts, etc.)
5. safetyConcern : préoccupation sécuritaire (true/false)

Réponds UNIQUEMENT avec un objet JSON valide.
            `;

            const result = await this.model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Impossible de parser la réponse');
        } catch (error) {
            console.error('Erreur analyse image Gemini:', error);
            return { error: error.message };
        }
    }

    // Monitoring et détection d'anomalies
    async analyzeComplaintsTrend(complaints) {
        if (!this.enabled) {
            return { error: 'Service Gemini non configuré' };
        }

        try {
            const summary = complaints.map(c => ({
                date: c.createdAt,
                category: c.geminiAnalysis?.category || c.department,
                status: c.status,
                urgency: c.geminiAnalysis?.urgency
            }));

            const prompt = `
Analyse ces données de plaintes municipales et détecte les tendances/anomalies :

${JSON.stringify(summary, null, 2)}

Fournis :
1. trends : array de tendances observées (ex: "Augmentation des plaintes de voirie")
2. anomalies : array d'anomalies détectées (ex: "Pic inhabituel le 10/12")
3. recommendations : array de recommandations (ex: "Renforcer l'équipe voirie")
4. alerts : array d'alertes urgentes

Réponds UNIQUEMENT avec un objet JSON valide.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Impossible de parser la réponse');
        } catch (error) {
            console.error('Erreur analyse trends Gemini:', error);
            return { error: error.message };
        }
    }

    // Assistant conversationnel
    async chatAssistant(userMessage, context = {}) {
        if (!this.enabled) {
            return 'Désolé, le service d\'assistance IA n\'est pas disponible actuellement.';
        }

        try {
            const prompt = `
Tu es un assistant virtuel pour la plateforme FASONEKRE de gestion des plaintes municipales au Burkina Faso.

Contexte : ${JSON.stringify(context)}
Message utilisateur : "${userMessage}"

Réponds de manière utile, concise et professionnelle en français.
Si l'utilisateur demande de l'aide pour déposer une plainte, guide-le étape par étape.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Erreur chat Gemini:', error);
            return 'Désolé, une erreur s\'est produite. Veuillez réessayer.';
        }
    }
}

module.exports = GeminiService;
