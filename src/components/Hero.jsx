import React from "react";
import { Download } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import profileData from "../data/profile.json";

export default function Hero({ isLightMode = false }) {
  const {
    name = "Andree Aarom Sosa Ardiles",
    title = "Ingeniero de Sistemas e Informática",
    photo = "/images/photo_home.webp",
    cvFile = "/CV_ANDREE_SOSA.pdf"
  } = profileData || {};

  return (
    <section
      id="hero"
      data-snap-section="hero"
      className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden transition-colors duration-350"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Background Photo (images/photo_home.webp with subtle non-exaggerated bottom transition) */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src={photo}
          alt={name}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-[center_35%]"
        />
        {/* Subtle, non-exaggerated bottom fade (only bottom 18% so legs/suit stay clear and blend into next section) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-350"
          style={{
            background: isLightMode
              ? "linear-gradient(to bottom, transparent 0%, transparent 80%, rgba(227, 218, 201, 0.45) 90%, var(--bg) 100%)"
              : "linear-gradient(to bottom, transparent 0%, transparent 80%, rgba(8, 8, 8, 0.5) 90%, var(--bg) 100%)"
          }}
        />
      </div>

      {/* Centered Content: Name, Profession, and Descargar CV */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center flex flex-col items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight font-title leading-tight"
          style={{
            color: isLightMode ? "#080808" : "#E3DAC9",
            textShadow: isLightMode
              ? "0 1px 12px rgba(227, 218, 201, 0.95), 0 0 20px rgba(227, 218, 201, 0.85)"
              : "0 2px 14px rgba(0, 0, 0, 0.95), 0 0 24px rgba(0, 0, 0, 0.75)"
          }}
        >
          {name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-2 text-[11px] sm:text-xs md:text-sm font-light tracking-wider"
          style={{
            color: isLightMode ? "rgba(8, 8, 8, 0.88)" : "rgba(227, 218, 201, 0.95)",
            textShadow: isLightMode
              ? "0 1px 8px rgba(227, 218, 201, 0.9), 0 0 14px rgba(227, 218, 201, 0.8)"
              : "0 2px 10px rgba(0, 0, 0, 0.95), 0 0 16px rgba(0, 0, 0, 0.7)"
          }}
        >
          {title}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-4 sm:mt-5 flex justify-center w-full"
        >
          <a
            href={cvFile}
            download
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 sm:px-4.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer border shadow-md"
            style={{
              backgroundColor: isLightMode ? "#080808" : "#E3DAC9",
              color: isLightMode ? "#E3DAC9" : "#080808",
              borderColor: isLightMode ? "#080808" : "#E3DAC9"
            }}
          >
            <Download size={13} weight="bold" />
            <span>Descargar CV</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
