import React, { useState, useEffect } from "react";
import { X, ArrowRight } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import AASALogo from "./AASALogo";

export default function Navbar({ activePage, onNavigate, isLightMode, onToggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 36);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: "home",
      name: "Home",
      subtitle: "Portada, Biografía, Cilindro 3D & Habilidades"
    },
    {
      id: "certificaciones",
      name: "Certificaciones",
      subtitle: "Certificados Oficiales, Liderazgo & Voluntariado"
    },
    {
      id: "proyectos",
      name: "Proyectos",
      subtitle: "Sistemas desarrollados y vistas previas"
    }
  ];

  const handleSelectPage = (pageId) => {
    onNavigate(pageId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      {/* Always Transparent Header */}
      <header className="fixed top-0 left-0 right-0 z-40 py-5 px-6 sm:px-10 bg-transparent pointer-events-none">
        <div className="relative max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Left: ONLY the 2 simple lines */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Abrir menú lateral"
            className="pointer-events-auto p-3 flex flex-col justify-center items-center gap-2 cursor-pointer group outline-none focus:outline-none focus-visible:outline-none"
            style={{
              filter: isLightMode
                ? "drop-shadow(0 1px 4px rgba(227, 218, 201, 0.95))"
                : "drop-shadow(0 1px 4px rgba(0, 0, 0, 0.85))"
            }}
          >
            <span
              className="block h-[2px] w-8 transition-transform duration-300 group-hover:scale-x-110 rounded-full"
              style={{ backgroundColor: "var(--fg)" }}
            />
            <span
              className="block h-[2px] w-8 transition-transform duration-300 group-hover:scale-x-110 rounded-full"
              style={{ backgroundColor: "var(--fg)" }}
            />
          </button>

          {/* Center: Flatter, tighter "AASA" Logo — ONLY visible at the very top of the page */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center transition-all duration-300 ${
              isAtTop
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-3"
            }`}
          >
            <AASALogo isLightMode={isLightMode} />
          </div>

          {/* Right: Bare Sun <-> Moon SVG Toggle Button (No circle, only symbol) */}
          <button
            onClick={onToggleTheme}
            aria-label="Cambiar tema de color"
            className="pointer-events-auto p-2 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 outline-none focus:outline-none focus-visible:outline-none"
            style={{
              color: "var(--fg)",
              filter: isLightMode
                ? "drop-shadow(0 1px 4px rgba(227, 218, 201, 0.95))"
                : "drop-shadow(0 1px 4px rgba(0, 0, 0, 0.85))"
            }}
          >
            <motion.svg
              key={isLightMode ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isLightMode ? (
                /* Moon SVG: filled solid crescent silhouette for clear, recognizable icon */
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              ) : (
                /* Sun SVG */
                <>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </>
              )}
            </motion.svg>
          </button>
        </div>
      </header>

      {/* Full-Screen Length Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {/* Full-Page Length Drawer Panel (abarcando toda la página) */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-0 z-50 w-full min-h-screen p-6 sm:p-12 md:p-16 flex flex-col justify-between overflow-y-auto"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--fg)"
              }}
            >
              <div>
                {/* Top header bar: close button only */}
                <div
                  className="max-w-6xl mx-auto w-full flex items-center justify-end pb-6 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar menú"
                    className="p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
                    style={{ color: "var(--fg)" }}
                  >
                    <X size={28} />
                  </button>
                </div>

                {/* Page Links: Text on top, clean horizontal line underneath, NO numbers, NO subtitles, balanced font size */}
                <nav className="max-w-6xl mx-auto w-full mt-10 sm:mt-14 flex flex-col">
                  {menuItems.map((item) => {
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectPage(item.id)}
                        className="group w-full text-left py-5 sm:py-7 border-b transition-all flex items-center justify-between cursor-pointer"
                        style={{
                          borderColor: isActive ? "var(--fg)" : "var(--border-color)",
                          color: "var(--fg)"
                        }}
                      >
                        <span
                          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-title tracking-tight transition-transform duration-300 group-hover:translate-x-3 ${
                            isActive ? "opacity-100" : "opacity-65 group-hover:opacity-100"
                          }`}
                        >
                          {item.name}
                        </span>
                        <ArrowRight
                          size={28}
                          className={`transition-all duration-300 group-hover:translate-x-3 ${
                            isActive ? "opacity-100" : "opacity-30 group-hover:opacity-100"
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer (No Descargar CV button) */}
              <div
                className="max-w-6xl mx-auto w-full pt-8 border-t flex items-center justify-between mt-12"
                style={{ borderColor: "var(--border-color)" }}
              >
                <p
                  className="text-xs sm:text-sm font-mono"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  Andree Aarom Sosa Ardiles • Portafolio Profesional 2026
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
