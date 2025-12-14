import React, { useState } from "react";
import NAVLOGO from "../Images/fasonekre.png";
import { Link } from "react-router-dom";

export default function UserNavbar(props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileClick = (val, view) => {
    props.handle(val, view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Navbar (Top) */}
      <nav className="md:hidden w-full bg-[#1e293b] flex flex-col sticky top-0 z-50 shadow-md">
        <div className="h-20 flex items-center justify-between px-4 w-full">
          <div className="flex items-center">
            <button onClick={toggleMenu} className="mr-3 text-white focus:outline-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <img src={NAVLOGO} alt="FASONEKRE" className="h-10 mr-2" />
            <h1 className="text-xl font-bold text-white">FASONEKRE</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/userlogin" className="text-xs border border-gray-400 text-gray-200 rounded px-2 py-1 hover:bg-gray-700 transition">
              LOGOUT
            </Link>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-[#2d3b4e] w-full flex flex-col py-2 border-t border-gray-600">
            <a
              className={`px-6 py-3 text-white hover:bg-slate-600 cursor-pointer flex items-center transition-colors ${props.clicked === "1" ? "bg-slate-600 border-l-4 border-green-500" : ""}`}
              onClick={() => handleMobileClick("1", "profile")}
            >
              <span className="mr-3">🏠</span> {props.first || "ACCUEIL"}
            </a>
            <a
              className={`px-6 py-3 text-white hover:bg-slate-600 cursor-pointer flex items-center transition-colors ${props.clicked === "2" ? "bg-slate-600 border-l-4 border-green-500" : ""}`}
              onClick={() => handleMobileClick("2", "view")}
            >
              <span className="mr-3">📋</span> {props.second || "MES PLAINTES"}
            </a>
            <a
              className={`px-6 py-3 text-white hover:bg-slate-600 cursor-pointer flex items-center transition-colors ${props.clicked === "3" ? "bg-slate-600 border-l-4 border-green-500" : ""}`}
              onClick={() => handleMobileClick("3", "new")}
            >
              <span className="mr-3">➕</span> {props.third || "NOUVELLE PLAINTE"}
            </a>
            {props.fourth && (
              <a
                className={`px-6 py-3 text-white hover:bg-slate-600 cursor-pointer flex items-center transition-colors ${props.clicked === "4" ? "bg-slate-600 border-l-4 border-green-500" : ""}`}
                onClick={() => handleMobileClick("4", "update")}
              >
                <span className="mr-3">⚙️</span> {props.fourth}
              </a>
            )}
          </div>
        )}
      </nav>

      {/* Desktop Sidebar (Left) */}
      <div className="hidden md:flex flex-col w-64 h-screen bg-[#1e293b] text-white fixed left-0 top-0 z-50 shadow-lg">
        <div className="flex flex-col items-center justify-center h-48 border-b border-gray-700">
          <img src={NAVLOGO} alt="FASONEKRE" className="h-24 mb-4" />
          <h1 className="text-2xl font-bold tracking-wider">FASONEKRE</h1>
        </div>

        <nav className="flex-1 flex flex-col py-6 space-y-2">
          <a
            className={`px-6 py-3 hover:bg-slate-700 cursor-pointer flex items-center transition-colors ${props.clicked === "1" ? "bg-slate-700 border-r-4 border-green-500" : ""}`}
            onClick={() => props.handle("1", "profile")}
          >
            <span className="mr-3">🏠</span> {props.first || "ACCUEIL"}
          </a>
          <a
            className={`px-6 py-3 hover:bg-slate-700 cursor-pointer flex items-center transition-colors ${props.clicked === "2" ? "bg-slate-700 border-r-4 border-green-500" : ""}`}
            onClick={() => props.handle("2", "view")}
          >
            <span className="mr-3">📋</span> {props.second || "MES PLAINTES"}
          </a>
          <a
            className={`px-6 py-3 hover:bg-slate-700 cursor-pointer flex items-center transition-colors ${props.clicked === "3" ? "bg-slate-700 border-r-4 border-green-500" : ""}`}
            onClick={() => props.handle("3", "new")}
          >
            <span className="mr-3">➕</span> {props.third || "NOUVELLE PLAINTE"}
          </a>
          {props.fourth && (
            <a
              className={`px-6 py-3 hover:bg-slate-700 cursor-pointer flex items-center transition-colors ${props.clicked === "4" ? "bg-slate-700 border-r-4 border-green-500" : ""}`}
              onClick={() => props.handle("4", "update")}
            >
              <span className="mr-3">⚙️</span> {props.fourth}
            </a>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link to="/userlogin" className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors">
            LOGOUT
          </Link>
        </div>
      </div>
    </>
  );
}