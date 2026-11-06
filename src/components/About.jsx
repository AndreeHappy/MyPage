import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassPlus,
  X,
  FilePdf
} from "@phosphor-icons/react";
import profile from "../data/profile.json";

export default function About() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <section
      id="sobre-mi"
      data-snap-section="about"
      className="min-h-[100dvh] flex items-center justify-center py-16 relative border-t transition-colors duration-300"
      style={{
        backgroundColor: "transparent",
        borderColor: "var(--border-color)",
        color: "var(--fg)"
      }}
    >
      <div className="max-w-7xl w-full mx-auto px-6 ocean-sway-gentle">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Perfil Profesional */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 flex flex-col gap-6"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-title tracking-tight">
                Perfil Profesional
              </h2>
              <div
                className="h-1 w-24 rounded-full mt-3"
                style={{ backgroundColor: "var(--fg)" }}
              />
            </div>

            <p
              className="text-base sm:text-lg leading-relaxed font-light"
              style={{ color: "var(--fg-muted)" }}
            >
              {profile.summary}
            </p>
          </motion.div>

          {/* Right Column: Bachiller Diploma Horizontal Preview */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 flex justify-center items-center"
          >
            <div
              onClick={() => setIsModalOpen(true)}
              className="group relative w-full max-w-xl aspect-[1.414/1] rounded-2xl overflow-hidden border-2 p-1.5 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)"
              }}
              title="Click para ver el diploma completo (Anverso y Reverso)"
            >
              <img
                src="/documents/bachiller-page-1.webp"
                alt="Grado Académico de Bachiller - Andree Aarom Sosa Ardiles"
                className="w-full h-full object-contain rounded-xl"
              />

              {/* Hover Badge Indicator */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl">
                <span className="px-4 py-2.5 rounded-xl bg-black/85 backdrop-blur-md text-white font-mono text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 shadow-lg">
                  <MagnifyingGlassPlus size={18} />
                  Ver Diploma Completo (Anverso y Reverso)
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Horizontal Modal (Anverso y Reverso horizontales lado a lado) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border p-4 sm:p-6 shadow-2xl"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-color)",
                color: "var(--fg)"
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-4">
                <div>
                  <h3 className="text-base sm:text-xl font-bold font-title">
                    Grado de Bachiller en Ingeniería de Sistemas e Informática
                  </h3>
                  <p
                    className="text-xs sm:text-sm font-mono mt-0.5"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Universidad Nacional de Moquegua (UNAM) • Registro Oficial
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/documents/bachiller.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-medium flex items-center gap-1.5 transition-colors hover:bg-white/10"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <FilePdf size={18} />
                    <span>Abrir PDF</span>
                  </a>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Cerrar modal"
                    className="p-1.5 rounded-lg border transition-colors hover:bg-white/10"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body: 2 Pages Shown Horizontally (Anverso y Reverso horizontales) */}
              <div className="flex-1 overflow-y-auto md:overflow-hidden pt-4 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center justify-center h-full">
                  {/* Página 1: Anverso */}
                  <div className="flex flex-col items-center">
                    <span
                      className="text-xs font-mono mb-2"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      Página 01 // Anverso
                    </span>
                    <div className="rounded-xl overflow-hidden border shadow-lg max-h-[64vh] flex items-center justify-center bg-black/20" style={{ borderColor: "var(--border-color)" }}>
                      <img
                        src="/documents/bachiller-page-1.webp"
                        alt="Bachiller Anverso"
                        className="max-h-[60vh] w-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Página 2: Reverso */}
                  <div className="flex flex-col items-center">
                    <span
                      className="text-xs font-mono mb-2"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      Página 02 // Reverso (Firmas & Registro)
                    </span>
                    <div className="rounded-xl overflow-hidden border shadow-lg max-h-[64vh] flex items-center justify-center bg-black/20" style={{ borderColor: "var(--border-color)" }}>
                      <img
                        src="/documents/bachiller-page-2.webp"
                        alt="Bachiller Reverso"
                        className="max-h-[60vh] w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
