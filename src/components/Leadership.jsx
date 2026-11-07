import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HandHeart, MapPin, CalendarBlank, MagnifyingGlassPlus, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import profileData from "../data/profile.json";

export default function Leadership() {
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (!selectedDoc) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedDoc(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedDoc]);

  return (
    <section
      id="liderazgo"
      className="relative py-24 border-t transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--border-color)",
        color: "var(--fg)"
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold font-title">
            Liderazgo & Voluntariado
          </h2>
          <div
            className="h-1 w-20 rounded-full mt-3"
            style={{ backgroundColor: "var(--fg)" }}
          />
        </div>

        <div className="flex flex-col gap-10">
          {profileData.leadership?.map((item, index) => (
            <div
              key={index}
              className="p-6 sm:p-8 rounded-2xl border transition-all"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)"
              }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div
                  className="hidden md:flex p-4 rounded-2xl border flex-shrink-0"
                  style={{
                    backgroundColor: "var(--fg)",
                    color: "var(--bg)",
                    borderColor: "var(--fg)"
                  }}
                >
                  <HandHeart size={32} weight="duotone" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                    <div>
                      <h3 className="text-xl font-bold font-title flex items-center gap-3">
                        <span className="md:hidden">
                          <HandHeart size={24} weight="duotone" />
                        </span>
                        {item.organization}
                      </h3>
                      <p
                        className="font-mono text-sm mt-1 font-semibold"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {item.role}
                      </p>
                    </div>

                    <div
                      className="flex flex-col items-start md:items-end gap-1 text-xs font-mono"
                      style={{ color: "var(--fg-subtle)" }}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarBlank size={15} />
                        <span>{item.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={15} />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <p
                    className="text-sm leading-relaxed mt-4 max-w-3xl"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {item.description}
                  </p>

                  {item.documentImage && (
                    <div
                      className="mt-5 pt-4 border-t flex items-center justify-between"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <span className="text-xs font-mono opacity-70">
                        Constancia Oficial
                      </span>
                      <button
                        onClick={() => setSelectedDoc(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: "var(--bg)",
                          borderColor: "var(--border-color)",
                          color: "var(--fg)"
                        }}
                      >
                        <MagnifyingGlassPlus size={15} weight="bold" />
                        <span>Ver Constancia</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Constancia Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedDoc && (
              <div
                onClick={() => setSelectedDoc(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.22 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden my-auto"
                  style={{
                    backgroundColor: "var(--bg)",
                    borderColor: "var(--border-color)",
                    color: "var(--fg)"
                  }}
                >
                  <div
                    className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <div className="flex flex-col pr-4">
                      <span className="text-[11px] sm:text-xs font-mono opacity-70">
                        CONSTANCIA OFICIAL // {selectedDoc.period}
                      </span>
                      <h3 className="text-base sm:text-xl font-bold font-title line-clamp-1">
                        {selectedDoc.organization}
                      </h3>
                    </div>

                    <button
                      onClick={() => setSelectedDoc(null)}
                      aria-label="Cerrar modal"
                      className="p-1.5 sm:p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70 border border-transparent hover:border-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-3 sm:p-6 overflow-y-auto flex items-center justify-center bg-black/30">
                    <img
                      src={selectedDoc.documentImage}
                      alt={selectedDoc.role}
                      className="max-h-[min(66vh,540px)] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
