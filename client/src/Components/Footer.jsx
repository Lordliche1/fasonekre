import React from "react";
import NAVLOGO from "../Images/fasonekre.png";

export default function Footer(props) {
  return (
    <footer className="bg-[#1e293b] text-white">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <img src={NAVLOGO} className="h-10 mr-3" alt="FASONEKRE Logo" />
              <div className="flex flex-col">
                <span className="self-center text-2xl font-bold whitespace-nowrap">
                  FASONEKRE
                </span>
                <span className="text-xs text-gray-400">Votre voix compte</span>
              </div>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-gray-400">
                Ressources
              </h2>
              <ul className="text-gray-300 font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:text-white transition-colors">
                    Gouvernement BF
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Services Municipaux
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-gray-400">
                Suivez-nous
              </h2>
              <ul className="text-gray-300 font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-gray-400">
                Légal
              </h2>
              <ul className="text-gray-300 font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:text-white transition-colors">
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Conditions d'utilisation
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">
            © 2025{" "}
            <a href="/" className="hover:underline hover:text-white">
              FASONEKRE™
            </a>
            . Tous droits réservés.
          </span>
          <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
            {/* Social Icons (simplified for cleaner code, can add SVGs back if needed strictly) */}
          </div>
        </div>
      </div>
    </footer>
  );
}
