import React from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import location from "../Images/location.png";
import Loading from "./Loading";

export default function WelcomeContent() {
  const password = React.useRef();
  const cPassword = React.useRef();
  const [showErrorMessage, setShowErrorMessage] = React.useState(false);
  const [cPasswordClass, setCPasswordClass] = React.useState("form-control");
  const [isCPasswordDirty, setIsCPasswordDirty] = React.useState(false);

  React.useEffect(() => {
    if (isCPasswordDirty) {
      if (password.current.value === cPassword.current.value) {
        setShowErrorMessage(false);
        setCPasswordClass("form-control is-valid");
      } else {
        setShowErrorMessage(true);
        setCPasswordClass("form-control is-invalid");
      }
    }
  }, [isCPasswordDirty]);

  const checkPasswords = (e) => {
    setIsCPasswordDirty(true);
    if (isCPasswordDirty) {
      if (password.current.value === cPassword.current.value) {
        setShowErrorMessage(false);
        setCPasswordClass("form-control is-valid");
      } else {
        setShowErrorMessage(true);
        setCPasswordClass("form-control is-invalid");
      }
    }
  };

  const [data, setData] = React.useState({
    name: "",
    email: "",
    password: "",
    age: "",
    phone: "",
    district: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.current.value != cPassword.current.value) {
      alert("Les mots de passe ne correspondent pas");
    } else if (
      data.name == "" ||
      data.email == "" ||
      data.password == "" ||
      data.age == "" ||
      data.phone == "" ||
      data.district == ""
    ) {
      alert("Veuillez remplir tous les champs");
    } else if (password.current.value.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
    } else if (data.age < 18) {
      alert("Vous devez avoir au moins 18 ans");
    } else {
      data.district = data.district[0].toUpperCase() + data.district.slice(1);
      console.log(data);
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/auth/register",
          data
        );
        setLoading(false);
        alert("Compte créé avec succès");
        console.log(response);
        navigate("/userlogin", {
          state: {
            token: response.data.token,
          },
          replace: true,
        });
      } catch (error) {
        console.log(error);
        setLoading(false);
        alert("Cet utilisateur existe déjà");
      }
    }
  }

  // Communes du Burkina Faso
  const communes = [
    "Ouagadougou",
    "Bobo-Dioulasso",
    "Koudougou",
    "Ouahigouya",
    "Banfora",
    "Dédougou",
    "Kaya",
    "Tenkodogo",
    "Fada N'Gourma",
    "Houndé",
    "Réo",
    "Manga",
    "Ziniaré",
    "Gaoua",
    "Dori",
    "Djibo",
    "Koupéla",
    "Pouytenga",
    "Garango",
    "Kombissiri",
    "Pô",
    "Léo",
    "Sapouy",
    "Tenado",
    "Barsalogho",
    "Boulsa",
    "Kongoussi",
    "Tougouri",
    "Yako",
    "Gourcy",
    "Thiou",
    "Titao",
    "Koumbri",
    "Orodara",
    "Dano",
    "Diébougou",
    "Batié",
    "Boromo",
    "Nouna",
    "Solenzo",
    "Tougan",
    "Sindou",
    "Mangodara",
    "Niangoloko",
    "Tiéfora",
    "Diapaga",
    "Gayéri",
    "Pama",
    "Zorgho",
    "Zitenga",
    "Gorom-Gorom",
    "Sebba",
    "Toma",
    "Bondokuy",
    "Safané",
    "Kampti",
    "Dissin",
    "Midebdo",
    "Komki-Ipala",
    "Komsilga",
    "Koubri",
    "Loumbila",
    "Pabré",
    "Saaba",
    "Tanghin-Dassouri",
  ];

  return (
    <>
      <div className="flex-row md:flex md:h-100 mt-0">
        {/* Section gauche - Présentation */}
        <div className="px-8 md:w-2/3 bg-gradient-to-br from-green-600 to-yellow-500">
          <div className="md:px-20 px-10 pt-20 md:pt-48 py-20">
            <div className="w-full md:w-2/3">
              <h1 className="mt-0 text-7xl font-bold text-white mb-4">
                FASONEKRE
              </h1>
              <p className="text-xl text-white mb-6">
                Plateforme Citoyenne de Gestion de Plaintes
              </p>
              <p className="mt-4 text-lg md:text-xl text-white opacity-90">
                Signalez les problèmes de votre commune et suivez leur
                résolution en temps réel. Ensemble, construisons un Burkina
                Faso meilleur.
              </p>
              <div className="mt-8 flex items-center text-white">
                <img src={location} alt="Location" className="w-6 h-6 mr-2" />
                <span className="text-lg">Burkina Faso - Toutes les communes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire d'inscription */}
        <div className="md:px-12 px-8 py-12 md:w-1/2 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Créer un compte
            </h2>
            <p className="text-gray-600 mb-8">
              Rejoignez FASONEKRE et participez à l'amélioration de votre commune
            </p>

            <form onSubmit={handleSubmit}>
              {/* Nom complet */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Votre nom complet"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="exemple@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Téléphone */}
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  placeholder="+226 XX XX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Âge */}
              <div className="mb-4">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Âge
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  placeholder="18"
                  min="18"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Commune */}
              <div className="mb-4">
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                  Commune
                </label>
                <select
                  name="district"
                  id="district"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionnez votre commune --</option>
                  {communes.sort().map((commune, index) => (
                    <option key={index} value={commune}>
                      {commune}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mot de passe */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  ref={password}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Confirmer mot de passe */}
              <div className="mb-6">
                <label htmlFor="cPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="cPassword"
                  id="cPassword"
                  ref={cPassword}
                  placeholder="Confirmez votre mot de passe"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${showErrorMessage ? "border-red-500" : "border-gray-300"
                    }`}
                  onChange={checkPasswords}
                  required
                />
                {showErrorMessage && (
                  <p className="mt-2 text-sm text-red-600">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-yellow-600 transition duration-300 shadow-lg"
                disabled={loading}
              >
                {loading ? "Création en cours..." : "Créer mon compte"}
              </button>

              {loading && (
                <div className="mt-4 flex justify-center">
                  <Loading />
                </div>
              )}

              {/* Lien vers connexion */}
              <p className="mt-6 text-center text-gray-600">
                Vous avez déjà un compte ?{" "}
                <NavLink
                  to="/userlogin"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Se connecter
                </NavLink>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
