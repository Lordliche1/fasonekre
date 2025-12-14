import React, { useState } from 'react';
import axios from "axios";
import Loading from './Loading';
import GeolocationCapture from './GeolocationCapture';
import MediaCapture from './MediaCapture';

function FileNewGrievance(props) {
  const [data, setData] = useState({ subject: "", description: "", department: "" });
  const [location, setLocation] = useState(null);
  const [mediaFiles, setMediaFiles] = useState({ photos: [], videos: [], audio: [] });
  const [geminiAnalysis, setGeminiAnalysis] = useState(null);
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  // Analyse automatique avec Gemini AI
  const analyzeWithGemini = async () => {
    if (!data.description) {
      alert("Veuillez d'abord décrire votre plainte");
      return;
    }

    setAnalyzingWithAI(true);
    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/gemini/analyze-complaint',
        { text: data.description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setGeminiAnalysis(response.data.analysis);

        // Suggérer le département si disponible
        if (response.data.analysis.department && !data.department) {
          setData({ ...data, department: response.data.analysis.department });
        }
      }
    } catch (error) {
      console.error('Erreur analyse Gemini:', error);
    } finally {
      setAnalyzingWithAI(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (data.subject === "" || data.description === "" || data.department === "") {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);

    try {
      // Créer FormData pour envoyer fichiers + données
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('department', data.department);

      // Ajouter la géolocalisation
      if (location) {
        formData.append('location', JSON.stringify({
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          address: location.address,
          capturedAt: new Date()
        }));
      }

      // Ajouter l'analyse Gemini
      if (geminiAnalysis) {
        formData.append('geminiAnalysis', JSON.stringify(geminiAnalysis));
      }

      // Ajouter les fichiers médias
      mediaFiles.photos.forEach((photo, idx) => {
        formData.append('photos', photo.file);
      });
      mediaFiles.videos.forEach((video, idx) => {
        formData.append('videos', video.file);
      });
      mediaFiles.audio.forEach((audio, idx) => {
        formData.append('audio', audio.file);
      });

      const response = await axios.post(
        'http://localhost:3000/api/v1/complaints/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log('Plainte créée:', response.data);
      setSubmit(true);
      setLoading(false);
      alert("Plainte déposée avec succès !");

      // Réinitialiser le formulaire
      setTimeout(() => {
        window.location.reload(true);
      }, 1500);

    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
      alert("Erreur: " + (error.response?.data?.message || error.message));
    }
  }

  return (
    <>
      <div
        className={
          props.visible === "new"
            ? "p-4 update-profile-content dashboard w-full md:w-3/4 h-100 pt-10"
            : "hidden"
        }
      >
        <h1 className="md:text-7xl text-4xl font-bold text-black capitalize dark:text-black py-4 text-center px-20">
          Déposer une Plainte
        </h1>

        <div className='flex justify-center'>
          <form className="border-2 shadow-2xl p-6 mt-8 w-11/12 md:w-4/6 rounded-xl">

            {/* Géolocalisation */}
            <GeolocationCapture onLocationCapture={setLocation} />

            {/* Capture Multimédia */}
            <MediaCapture onMediaCapture={setMediaFiles} />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 px-4">

              {/* Département */}
              <div>
                <label className="text-black dark:text-gray-200" htmlFor="Dept">
                  Département *
                </label>
                <select
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                  onChange={(e) => handleChange(e)}
                  name="department"
                  value={data.department}
                >
                  <option value="">--SÉLECTIONNER--</option>
                  <option value="Voirie">Voirie</option>
                  <option value="Assainissement">Assainissement</option>
                  <option value="Éclairage Public">Éclairage Public</option>
                  <option value="Espaces Verts">Espaces Verts</option>
                  <option value="Santé">Santé</option>
                  <option value="Éducation">Éducation</option>
                  <option value="Transport">Transport</option>
                  <option value="Sécurité">Sécurité</option>
                  <option value="Autre">Autre</option>
                </select>
                {geminiAnalysis?.department && (
                  <p className="text-sm text-blue-600 mt-1">
                    🤖 Gemini suggère: {geminiAnalysis.department}
                  </p>
                )}
              </div>

              {/* Sujet */}
              <div>
                <label
                  className="text-black dark:text-gray-200"
                  htmlFor="Subject"
                >
                  Sujet *
                </label>
                <input
                  id="Subject"
                  name="subject"
                  type="text"
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                  onChange={(e) => handleChange(e)}
                  value={data.subject}
                  placeholder="Ex: Nid-de-poule sur la route principale"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="text-black dark:text-gray-200"
                  htmlFor="description"
                >
                  Description détaillée *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  className="block w-full px-4 py-3 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
                  onChange={(e) => handleChange(e)}
                  value={data.description}
                  placeholder="Décrivez votre plainte en détail..."
                ></textarea>

                {/* Bouton Analyse Gemini */}
                <button
                  type="button"
                  onClick={analyzeWithGemini}
                  disabled={analyzingWithAI || !data.description}
                  className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {analyzingWithAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyse en cours...
                    </>
                  ) : (
                    <>🤖 Analyser avec Gemini AI</>
                  )}
                </button>
              </div>

              {/* Résultats Analyse Gemini */}
              {geminiAnalysis && (
                <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                  <h4 className="font-bold text-purple-800 mb-2">🤖 Analyse Gemini AI</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {geminiAnalysis.category && (
                      <div>
                        <span className="font-semibold">Catégorie:</span> {geminiAnalysis.category}
                      </div>
                    )}
                    {geminiAnalysis.urgency && (
                      <div>
                        <span className="font-semibold">Urgence:</span>{' '}
                        <span className={`px-2 py-1 rounded ${geminiAnalysis.urgency === 'critical' ? 'bg-red-200 text-red-800' :
                            geminiAnalysis.urgency === 'high' ? 'bg-orange-200 text-orange-800' :
                              geminiAnalysis.urgency === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'
                          }`}>
                          {geminiAnalysis.urgency}
                        </span>
                      </div>
                    )}
                    {geminiAnalysis.sentiment && (
                      <div>
                        <span className="font-semibold">Sentiment:</span> {geminiAnalysis.sentiment}
                      </div>
                    )}
                    {geminiAnalysis.summary && (
                      <div className="md:col-span-2">
                        <span className="font-semibold">Résumé:</span> {geminiAnalysis.summary}
                      </div>
                    )}
                    {geminiAnalysis.keywords && geminiAnalysis.keywords.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-semibold">Mots-clés:</span>{' '}
                        {geminiAnalysis.keywords.map((kw, idx) => (
                          <span key={idx} className="inline-block bg-purple-200 text-purple-800 px-2 py-1 rounded mr-2 mb-1">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-around mt-6" color="black">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 p-3 px-8 rounded-3xl text-white text-xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={(e) => handleSubmit(e)}
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Soumettre la Plainte'}
              </button>
            </div>

            {loading && <Loading />}

            <div className="text-green-600 flex justify-center mt-3 font-bold">
              {submit ? "✅ Votre plainte a été déposée avec succès !" : ""}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default FileNewGrievance;
