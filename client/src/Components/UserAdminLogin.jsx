import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import Loading from "./Loading";

function Login(props) {
  const [loginData, setLoginData] = React.useState({ email: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (loginData.email === "" || loginData.password === "") {
      setLoading(false);
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/auth/universal-login",
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Connexion réussie:", response.data);

      // Stocker le token et les infos utilisateur
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userRole", response.data.role);
      localStorage.setItem("userName", response.data.user.name);

      setLoading(false);

      // Rediriger selon le rôle
      navigate(response.data.redirectTo);

    } catch (error) {
      setLoading(false);
      console.error("Erreur connexion:", error);

      if (error.response && error.response.status === 401) {
        alert("Identifiants invalides");
      } else {
        alert("Erreur de connexion. Veuillez réessayer.");
      }
    }
  }

  function forgotPassword() {
    navigate("/ForgotPassword");
  }

  return (
    <>
      <Navbar />
      <div className="flex-row md:flex md:h-100 mt-0">
        <div className="px-8 md:w-2/3">
          <div className="md:px-20 px-10 pt-20 md:pt-48 py-20">
            <div className="w-full md:w-2/3 h-64">
              <h2 className="mt-0 text-6xl font-bold text-dark-blue">FASONEKRE</h2>

              <p className="mt-4 text md:text-2xl text-dark-blue">
                Cette plateforme permet aux citoyens et aux services municipaux de
                communiquer efficacement concernant les plaintes et réclamations,
                simplifiant ainsi le processus de gestion des doléances citoyennes
                au Burkina Faso.
              </p>
            </div>
          </div>
        </div>

        <div className="md:px-36 px-10 py-20 bg-dark-blue">
          <div>
            <p className="mt-3 text-2xl text-white">
              Connectez-vous pour accéder à votre compte
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm text-white">
                  Adresse Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="exemple@exemple.com"
                  className="block w-full px-4 py-2 mt-2 bg-white rounded-md"
                  onChange={handleChange}
                  value={loginData.email}
                />
              </div>

              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <label htmlFor="password" className="text-sm text-white">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    className="text-sm text-gray-400 text-white hover:underline"
                    onClick={forgotPassword}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="flex justify-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Votre mot de passe"
                    className="block w-full px-4 py-2 mt-2 bg-white rounded-md"
                    onChange={handleChange}
                    value={loginData.password}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-white p-2 rounded-3xl m-auto"
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-300 mb-4">
                  💡 Le système détectera automatiquement votre rôle
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  className="w-1/2 hover:animate-bounce px-4 py-2 text-white bg-light-green rounded-md"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </div>
              {loading && <Loading />}
            </form>

            <p className="mt-6 text-sm text-center text-white">
              Vous n'avez pas encore de compte ?{" "}
              <NavLink to="/" className="text-light-green hover:underline">
                S'inscrire
              </NavLink>
              .
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
