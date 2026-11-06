import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const ALL_SKILLS = [
  {
    num: "01",
    name: "Excel Avanzado (Macros & VBA)",
    category: "Datos & Automatización",
    level: "Avanzado",
    percentage: 95
  },
  {
    num: "02",
    name: "Power BI & DAX",
    category: "Datos & Automatización",
    level: "Avanzado",
    percentage: 90
  },
  {
    num: "03",
    name: "Python (Data & Scripting)",
    category: "Programación",
    level: "Avanzado",
    percentage: 85
  },
  {
    num: "04",
    name: "SQL & Bases de Datos",
    category: "Datos & Automatización",
    level: "Avanzado",
    percentage: 85
  },
  {
    num: "05",
    name: "Active Directory & Soporte TI",
    category: "Infraestructura",
    level: "Intermedio-Avanzado",
    percentage: 85
  },
  {
    num: "06",
    name: "OpenCV (Procesamiento de Imágenes)",
    category: "Programación",
    level: "Intermedio-Avanzado",
    percentage: 80
  },
  {
    num: "07",
    name: "Ciberseguridad: CyberSOC & SIEM",
    category: "Ciberseguridad",
    level: "Intermedio",
    percentage: 75
  },
  {
    num: "08",
    name: "Machine Learning (PyTorch / TensorFlow)",
    category: "Programación",
    level: "Intermedio",
    percentage: 75
  },
  {
    num: "09",
    name: "Git & Control de Versiones",
    category: "Programación",
    level: "Avanzado",
    percentage: 85
  },
  {
    num: "10",
    name: "Inglés Avanzado (B2)",
    category: "Idiomas",
    level: "Avanzado B2",
    percentage: 85
  },
  {
    num: "11",
    name: "Microsoft Word Intermedio-Avanzado",
    category: "Datos & Automatización",
    level: "Avanzado",
    percentage: 90
  },
  {
    num: "12",
    name: "Logística & Gestión Operativa",
    category: "Datos & Automatización",
    level: "Avanzado",
    percentage: 85
  }
];

const SHEET_1_SKILLS = ALL_SKILLS.slice(0, 6);
const SHEET_2_SKILLS = ALL_SKILLS.slice(6, 12);

// Organic Deckled Paper Silhouette Path (looks like a real hand-torn parchment sheet, not a plain rectangle!)
const ORGANIC_PAPER_PATH =
  "M 14,8 L 58,4 L 112,9 L 178,5 L 245,8 L 315,4 L 388,9 L 448,5 L 488,10 " +
  "L 495,55 L 491,115 L 496,175 L 492,240 L 497,310 L 491,375 L 496,445 L 492,515 L 496,578 L 490,628 " +
  "L 442,634 L 382,630 L 318,635 L 252,631 L 185,636 L 118,631 L 56,635 L 12,629 " +
  "L 6,575 L 11,510 L 5,442 L 10,378 L 6,312 L 11,245 L 5,180 L 10,115 L 6,52 Z";

function OrganicPaperSheet({
  sheetRef,
  rowRefs,
  barRefs,
  valRefs,
  sheetCode,
  skills,
  offsetIndex,
  isRightSheet,
  isLightMode
}) {
  const gradId = isRightSheet ? "paper-edge-shade-2" : "paper-edge-shade-1";
  const flagClass = isRightSheet ? "ocean-flag-right" : "ocean-flag-left";

  // Light mode: luminous warm-white parchment that floats cleanly over the cream #E3DAC9 water
  // Dark mode: antique bone parchment #E3DAC9 over deep black #080808 water
  const fillCenter = isLightMode ? "#FFFDF9" : "#EAE2D2";
  const fillMid = isLightMode ? "#FAF7EE" : "#E3DAC9";
  const fillEdge = isLightMode ? "#F2ECE0" : "#D5CBB5";
  const pathShadow = isLightMode
    ? "drop-shadow(0 14px 22px rgba(60, 50, 35, 0.08))"
    : "drop-shadow(0 22px 35px rgba(0, 0, 0, 0.65))";

  return (
    <div className={`w-full max-w-[500px] mx-auto ${flagClass}`}>
      <div
        ref={sheetRef}
        className="relative w-full py-8 px-7 sm:py-9 sm:px-9 lg:py-10 lg:px-11 will-change-transform"
        style={{
          color: "#080808"
        }}
      >
        {/* Organic Deckled Paper SVG Background (Tall vertical portrait proportion ~600x800, border completely invisible) */}
        <svg
          viewBox="0 0 500 642"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-visible"
        >
          <defs>
            <radialGradient id={gradId} cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor={fillCenter} />
              <stop offset="72%" stopColor={fillMid} />
              <stop offset="100%" stopColor={fillEdge} />
            </radialGradient>
          </defs>

          {/* Main Organic Torn Paper Silhouette - BORDER INVISIBLE (stroke="none"), shadow clings directly to torn path */}
          <path
            d={ORGANIC_PAPER_PATH}
            fill={`url(#${gradId})`}
            stroke="none"
            strokeWidth="0"
            style={{
              filter: pathShadow
            }}
          />
        </svg>

        {/* Sheet Foreground Ink Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="pb-3 mb-4 sm:mb-5 border-b border-[#080808]/20 flex items-baseline justify-between">
            <div className="text-xs sm:text-sm lg:text-[15px] font-bold font-title tracking-wider uppercase">
              AASA HABILIDADES & NIVEL
            </div>
            <div className="text-[11px] sm:text-xs font-mono opacity-75">
              {sheetCode}
            </div>
          </div>

          {/* 6 Skills on this Organic Paper Sheet - vertically paced in portrait format */}
          <div className="space-y-3.5 sm:space-y-4 lg:space-y-5">
            {skills.map((skill, idx) => {
              const globalIdx = offsetIndex + idx;

              return (
                <div
                  key={skill.num}
                  ref={(el) => {
                    rowRefs.current[globalIdx] = el;
                  }}
                  className="will-change-transform"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2 truncate">
                      <span className="text-[11px] sm:text-xs font-mono font-bold opacity-75">
                        {skill.num}
                      </span>
                      <h3 className="text-xs sm:text-sm lg:text-[15px] font-bold font-title leading-tight truncate">
                        {skill.name}
                      </h3>
                    </div>
                    <span
                      ref={(el) => {
                        valRefs.current[globalIdx] = el;
                      }}
                      className="text-xs font-black font-mono shrink-0"
                    >
                      0%
                    </span>
                  </div>

                  <div className="text-[10px] sm:text-[11px] font-mono opacity-70 leading-none mt-1">
                    {skill.category} · {skill.level}
                  </div>

                  {/* Ink Percentage Progress Bar */}
                  <div className="mt-1.5 h-1.5 sm:h-2 w-full rounded-sm border border-[#080808]/30 bg-[#080808]/10 overflow-hidden">
                    <div
                      ref={(el) => {
                        barRefs.current[globalIdx] = el;
                      }}
                      className="h-full bg-[#080808] transition-[width] duration-75"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Skills({ isLightMode }) {
  const sectionRef = useRef(null);
  const leftSheetRef = useRef(null);
  const rightSheetRef = useRef(null);
  const rowRefs = useRef([]);
  const barRefs = useRef([]);
  const valRefs = useRef([]);

  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      const leftSheet = leftSheetRef.current;
      const rightSheet = rightSheetRef.current;
      if (!sectionEl || !leftSheet || !rightSheet) return;

      const rows = rowRefs.current.filter(Boolean);
      const proxies = ALL_SKILLS.map(() => ({ val: 0 }));

      gsap.set(leftSheet, {
        opacity: 0,
        y: 55,
        x: -20,
        rotation: -6.5
      });
      gsap.set(rightSheet, {
        opacity: 0,
        y: 75,
        x: 20,
        rotation: 6.5
      });
      gsap.set(rows, { opacity: 0, y: 14 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 55%",
          end: "bottom 40%",
          toggleActions: "play none none reverse",
          onLeaveBack: () => {
            ALL_SKILLS.forEach((_, idx) => {
              if (barRefs.current[idx]) barRefs.current[idx].style.width = "0%";
              if (valRefs.current[idx]) valRefs.current[idx].textContent = "0%";
            });
          }
        }
      });

      // 1) Left Organic Sheet (HOJA 01) settles into its tilted-left pose (-3.2deg)
      tl.to(
        leftSheet,
        {
          opacity: 1,
          y: 0,
          x: 0,
          rotation: -3.2,
          duration: 0.8,
          ease: "power3.out"
        },
        0
      );

      // 2) Right Organic Sheet (HOJA 02) settles into its tilted-right pose (+3.2deg)
      tl.to(
        rightSheet,
        {
          opacity: 1,
          y: 0,
          x: 0,
          rotation: 3.2,
          duration: 0.8,
          ease: "power3.out"
        },
        0.15
      );

      // 3) Staggered smooth appearance of all 12 skills & animated percentage bars (zero React state overhead!)
      ALL_SKILLS.forEach((skill, idx) => {
        const isSecondSheet = idx >= 6;
        const localIdx = idx % 6;
        const startOffset = (isSecondSheet ? 0.26 : 0.12) + localIdx * 0.11;

        tl.to(
          rows[idx],
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out"
          },
          startOffset
        );

        tl.to(
          proxies[idx],
          {
            val: skill.percentage,
            duration: 1.0,
            ease: "power2.out",
            onUpdate: () => {
              const currentVal = Math.round(proxies[idx].val);
              if (barRefs.current[idx]) {
                barRefs.current[idx].style.width = `${currentVal}%`;
              }
              if (valRefs.current[idx]) {
                valRefs.current[idx].textContent = `${currentVal}%`;
              }
            }
          },
          startOffset + 0.08
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="habilidades"
      ref={sectionRef}
      data-snap-section="skills"
      className="relative z-10 min-h-[100dvh] border-t flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "transparent",
        borderColor: "var(--border-color)",
        color: "var(--fg)"
      }}
    >
      <div className="w-full max-w-[1080px] mx-auto">
        {/* Two Vertical Organic Torn-Edge Paper Sheets (Portrait 600x800 proportion, invisible border) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-14 items-center justify-center w-full">
          {/* HOJA 01 (01 — 06) */}
          <OrganicPaperSheet
            sheetRef={leftSheetRef}
            rowRefs={rowRefs}
            barRefs={barRefs}
            valRefs={valRefs}
            sheetCode="HOJA 01 // 01 — 06"
            skills={SHEET_1_SKILLS}
            offsetIndex={0}
            isRightSheet={false}
            isLightMode={isLightMode}
          />

          {/* HOJA 02 (07 — 12) */}
          <OrganicPaperSheet
            sheetRef={rightSheetRef}
            rowRefs={rowRefs}
            barRefs={barRefs}
            valRefs={valRefs}
            sheetCode="HOJA 02 // 07 — 12"
            skills={SHEET_2_SKILLS}
            offsetIndex={6}
            isRightSheet={true}
            isLightMode={isLightMode}
          />
        </div>
      </div>
    </section>
  );
}
