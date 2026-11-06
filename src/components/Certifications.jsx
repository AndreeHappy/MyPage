import React, { useState } from "react";
import {
  ArrowSquareOut,
  CheckCircle,
  FilePdf,
  MagnifyingGlassPlus,
  X,
  Clock,
  Buildings
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import certificatesData from "../data/certificates.json";

const certifications = Array.isArray(certificatesData) ? certificatesData : [];

// Helper to separate multiple institutions cleanly
function parseInstitutions(instStr = "") {
  return instStr
    .split(/[|/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Helper to get matching WebP thumbnail from public/documents/thumbnails/
function getThumbnailUrl(filePath = "") {
  if (!filePath) return "";
  const filename = filePath.split("/").pop() || "";
  const base = filename.replace(".pdf", "");
  return `/documents/thumbnails/${base}.webp`;
}

export default function Certifications() {
  const [activeCertModal, setActiveCertModal] = useState(null);

  return (
    <section
      id="certificaciones"
      className="relative z-10 pt-28 pb-24 transition-colors duration-300 min-h-screen"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)"
      }}
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Section Header (Cleaned, no extra text) */}
        <div
          className="mb-14 pb-6 border-b flex flex-col md:flex-row md:items-end justify-between gap-4 font-mono text-xs sm:text-sm"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-title tracking-tight text-[var(--fg)]">
              Cursos & Certificaciones
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs opacity-75 font-mono">
            <span className="px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
              {certifications.length} CERTIFICADOS OFICIALES
            </span>
          </div>
        </div>

        {/* Alternating Stack of Certificates (Intercalado: Izquierda-Derecha / Derecha-Izquierda) */}
        <div className="flex flex-col divide-y divide-[var(--border-color)]">
          {certifications.map((cert, index) => {
            const companies = parseInstitutions(cert.institution);
            const thumbnailUrl = getThumbnailUrl(cert.file);
            const certNum = String(index + 1).padStart(2, "0");
            const isEven = index % 2 === 0;

            return (
              <div
                key={cert.id || index}
                className="py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
              >
                {/* TEXT SIDE (Left on even, Right on odd in desktop) */}
                <div
                  className={`flex flex-col gap-4 ${
                    isEven
                      ? "lg:col-span-5 lg:order-1"
                      : "lg:col-span-5 lg:order-2"
                  }`}
                >
                  {/* Top Badge: Number, Year & Hours */}
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span
                      className="px-2.5 py-1 rounded border font-bold"
                      style={{
                        borderColor: "var(--fg)",
                        backgroundColor: "var(--fg)",
                        color: "var(--bg)"
                      }}
                    >
                      N° {certNum}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded border font-semibold"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      {cert.year}
                    </span>

                    {/* Academic Hours Pill */}
                    {cert.hours && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 font-bold text-[11px]">
                        <Clock size={13} weight="bold" />
                        <span>{cert.hours}</span>
                      </span>
                    )}
                  </div>

                  {/* Title of Certificate */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-title leading-snug tracking-tight text-[var(--fg)]">
                    {cert.name}
                  </h2>

                  {/* Certifying Companies (Empresas Certificadoras) */}
                  <div className="mt-1 flex flex-col gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">
                      {companies.length > 1 ? "Entidades Certificadoras:" : "Empresa Certificadora:"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {companies.map((comp) => (
                        <span
                          key={comp}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium"
                          style={{
                            backgroundColor: "var(--bg-card)",
                            borderColor: "var(--border-color)",
                            color: "var(--fg)"
                          }}
                        >
                          <Buildings size={14} className="opacity-70" />
                          <span>{comp}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Verification */}
                  <div className="flex flex-wrap items-center gap-3 pt-4">
                    {cert.file && (
                      <button
                        onClick={() => setActiveCertModal(cert)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-transform hover:scale-[1.02] active:scale-95 border cursor-pointer"
                        style={{
                          backgroundColor: "var(--fg)",
                          color: "var(--bg)",
                          borderColor: "var(--fg)"
                        }}
                      >
                        <FilePdf size={17} weight="bold" />
                        <span>Ver Documento</span>
                      </button>
                    )}

                    {cert.verifyUrl && (
                      <a
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-colors hover:underline border"
                        style={{
                          backgroundColor: "transparent",
                          borderColor: "var(--border-color)",
                          color: "var(--fg)"
                        }}
                      >
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span>Verificar Credencial</span>
                        <ArrowSquareOut size={13} />
                      </a>
                    )}
                  </div>
                </div>

                {/* VISUAL CERTIFICATE DOCUMENT SIDE (Right on even, Left on odd in desktop) */}
                <div
                  className={`flex justify-center items-center ${
                    isEven
                      ? "lg:col-span-7 lg:order-2"
                      : "lg:col-span-7 lg:order-1"
                  }`}
                >
                  <div
                    onClick={() => setActiveCertModal(cert)}
                    className="group relative w-full max-w-xl aspect-[1.414/1] cursor-pointer transition-all duration-500 ease-out flex items-center justify-center hover:-translate-y-2 hover:scale-[1.02]"
                    style={{
                      transform: isEven ? "rotate(1.2deg)" : "rotate(-1.2deg)",
                      filter:
                        "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.45)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))"
                    }}
                    title="Click para ampliar el certificado"
                  >
                    {/* Floating Authentic Document Preview (sin caja rígida) */}
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`Certificado Oficial — ${cert.name}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:rotate-0"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black/20 rounded-xl">
                        <FilePdf size={48} className="opacity-40" />
                        <span className="font-mono text-xs opacity-60">
                          Vista previa no disponible
                        </span>
                      </div>
                    )}

                    {/* Subtle Hover Inspection Pill */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                      <span className="px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md text-white font-mono text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 shadow-xl">
                        <MagnifyingGlassPlus size={18} />
                        Ampliar Certificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Modal Preview */}
      <AnimatePresence>
        {activeCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCertModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border-color)",
                color: "var(--fg)"
              }}
            >
              {/* Modal Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-mono opacity-70">
                    CERTIFICADO OFICIAL // {activeCertModal.year}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-title">
                    {activeCertModal.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {activeCertModal.file && (
                    <a
                      href={activeCertModal.file}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors hover:bg-white/10"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <FilePdf size={15} />
                      <span>Descargar PDF</span>
                    </a>
                  )}
                  <button
                    onClick={() => setActiveCertModal(null)}
                    aria-label="Cerrar modal"
                    className="p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Modal Certificate Visual View */}
              <div className="p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-black/30">
                <img
                  src={getThumbnailUrl(activeCertModal.file)}
                  alt={activeCertModal.name}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
