import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  CheckCircle,
  Database,
  Desktop,
  Browsers,
  FileXls,
  ArrowUpRight,
  X,
  MagnifyingGlassPlus,
  GithubLogo
} from "@phosphor-icons/react";
import profileData from "../data/profile.json";

gsap.registerPlugin(ScrollTrigger);

// Role icons matching the 6 experiences in exact user order:
// 1. Desarrollador Web
// 2. Encargado de Oficina / Ofimática
// 3. Soporte TI
// 4. ONPE Elecciones Generales
// 5. ONPE Segunda Elección
// 6. Proyectos en GitHub
const roleIcons = [
  Browsers,
  FileXls,
  Desktop,
  Database,
  CheckCircle,
  GithubLogo
];

const experiencesList = profileData?.experience || [];

// Build 6 faces per ring: 3 experiences * 2 cards each (1 Text Card + 1 Image Card)
function buildCylinderRing(experiencesSlice, ringOffsetIndex) {
  const faces = [];
  experiencesSlice.forEach((exp, idx) => {
    const globalNum = ringOffsetIndex + idx + 1;
    const Icon = roleIcons[(globalNum - 1) % roleIcons.length];

    // Card A: Concise centered text
    faces.push({
      type: "text",
      num: `0${globalNum}`,
      exp,
      Icon,
      invert: idx % 2 === 1
    });

    // Card B: Document / Constancia preview
    faces.push({
      type: "image",
      num: `0${globalNum}`,
      exp,
      Icon,
      invert: idx % 2 === 0
    });
  });
  return faces;
}

const ring1Faces = buildCylinderRing(experiencesList.slice(0, 3), 0);
const ring2Faces = buildCylinderRing(experiencesList.slice(3, 6), 3);

// Chunky geometric letters (Adumu / collegiate faceted blocky style) for 3D tumbling center tube
const LETTER_GEOMETRY = {
  A: {
    outer: [
      [-0.45, -1.0],
      [0.45, -1.0],
      [0.77, -0.75],
      [0.77, 1.0],
      [0.26, 1.0],
      [0.26, 0.40],
      [-0.26, 0.40],
      [-0.26, 1.0],
      [-0.77, 1.0],
      [-0.77, -0.75]
    ],
    holes: [
      [
        [-0.26, -0.52],
        [0.26, -0.52],
        [0.26, 0.04],
        [-0.26, 0.04]
      ]
    ]
  },
  S: {
    outer: [
      [-0.48, -1.0],
      [0.48, -1.0],
      [0.77, -0.75],
      [0.77, -0.33],
      [0.10, -0.33],
      [0.10, -0.57],
      [-0.23, -0.57],
      [-0.23, -0.17],
      [0.48, -0.17],
      [0.77, 0.08],
      [0.77, 0.75],
      [0.48, 1.0],
      [-0.48, 1.0],
      [-0.77, 0.75],
      [-0.77, 0.33],
      [-0.10, 0.33],
      [-0.10, 0.57],
      [0.23, 0.57],
      [0.23, 0.17],
      [-0.48, 0.17],
      [-0.77, -0.08],
      [-0.77, -0.75]
    ],
    holes: []
  }
};

// Rotate a 3D point [x, y, z] by Euler angles (rx, ry, rz) in radians
function rotate3D(pt, rx, ry, rz) {
  let [x, y, z] = pt;

  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;
  y = y1;
  z = z1;

  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x2 = x * cosY + z * sinY;
  const z2 = -x * sinY + z * cosY;
  x = x2;
  z = z2;

  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const x3 = x * cosZ - y * sinZ;
  const y3 = x * sinZ + y * cosZ;

  return [x3, y3, z];
}

function polyArea2D(pts) {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    area += p1.sx * p2.sy - p2.sx * p1.sy;
  }
  return area / 2;
}

function computeQuadNormal(p0, p1, p2) {
  const ax = p1.wx - p0.wx;
  const ay = p1.wy - p0.wy;
  const az = p1.wz - p0.wz;
  const bx = p2.wx - p0.wx;
  const by = p2.wy - p0.wy;
  const bz = p2.wz - p0.wz;
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}

// Render the 4 solid 3D letters "A", "A", "S", "A" in a vertical cascade with continuous 3D spin
function drawSolid3DLetters(canvas, progress, timeSec = 0) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = 1000;
  const height = 1000;
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  if (progress <= 0.015 || progress >= 0.985) {
    ctx.restore();
    return;
  }

  let alpha = 1;
  if (progress < 0.12) alpha = (progress - 0.015) / 0.105;
  else if (progress > 0.88) alpha = (0.985 - progress) / 0.105;
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const isLight = document.documentElement.classList.contains("theme-light");

  // Proportioned letters with clean vertical spacing (scaled down to fit gracefully inside the cylinder)
  const letters = [
    { char: "A", baseX: -20, offsetY: -260, phase: 0.0, spinDir: 1 },
    { char: "A", baseX: 20, offsetY: -85, phase: 1.4, spinDir: -1 },
    { char: "S", baseX: -20, offsetY: 85, phase: 2.8, spinDir: 1 },
    { char: "A", baseX: 20, offsetY: 260, phase: 4.2, spinDir: -1 }
  ];

  const fov = 1100;
  const cx = width / 2;
  const cy = height / 2;
  const scaleXY = 78; // Balanced size (scaled down from 108, was originally 60)
  const halfDepth = 26; // Solid, proportional 3D extrusion thickness (was 38)

  const groupY = -680 + progress * 1360;
  const lightDir = [-0.32, -0.62, 0.71];

  const allPolys = [];

  letters.forEach((item) => {
    const posY =
      groupY + item.offsetY + Math.sin(timeSec * 1.4 + item.phase) * 8;
    const posX =
      item.baseX + Math.cos(timeSec * 1.1 + item.phase) * 14;
    const posZ = Math.sin(timeSec * 1.2 + item.phase) * 20;

    const ry =
      timeSec * 0.9 * item.spinDir +
      progress * Math.PI * 2.5 * item.spinDir +
      item.phase;
    const rx = Math.sin(timeSec * 0.7 + item.phase) * 0.28 + 0.08;
    const rz = Math.cos(timeSec * 0.5 + item.phase) * 0.18;

    const geom = LETTER_GEOMETRY[item.char];

    const projectPoint = (vx, vy, zLocal) => {
      const [rxPt, ryPt, rzPt] = rotate3D(
        [vx * scaleXY, vy * scaleXY, zLocal],
        rx,
        ry,
        rz
      );
      const wx = rxPt + posX;
      const wy = ryPt + posY;
      const wz = rzPt + posZ;
      const persp = fov / (fov - wz);
      return {
        sx: cx + wx * persp,
        sy: cy + wy * persp,
        wx,
        wy,
        wz
      };
    };

    const frontOuter = geom.outer.map(([vx, vy]) => projectPoint(vx, vy, halfDepth));
    const backOuter = geom.outer.map(([vx, vy]) => projectPoint(vx, vy, -halfDepth));
    const frontHoles = geom.holes.map((hole) =>
      hole.map(([vx, vy]) => projectPoint(vx, vy, halfDepth))
    );
    const backHoles = geom.holes.map((hole) =>
      hole.map(([vx, vy]) => projectPoint(vx, vy, -halfDepth))
    );

    // Front Cap (Visible when facing camera)
    if (polyArea2D(frontOuter) > 0) {
      const norm = rotate3D([0, 0, 1], rx, ry, rz);
      const dot = Math.max(0, norm[0] * lightDir[0] + norm[1] * lightDir[1] + norm[2] * lightDir[2]);
      const avgZ = frontOuter.reduce((acc, p) => acc + p.wz, 0) / frontOuter.length;
      allPolys.push({
        isCap: true,
        outer: frontOuter,
        holes: frontHoles,
        avgZ,
        diffuse: 0.45 + 0.55 * dot
      });
    }

    // Back Cap (Also a face of the letter, reversed winding for outward normal)
    const backOuterRev = [...backOuter].reverse();
    if (polyArea2D(backOuterRev) > 0) {
      const norm = rotate3D([0, 0, -1], rx, ry, rz);
      const dot = Math.max(0, norm[0] * lightDir[0] + norm[1] * lightDir[1] + norm[2] * lightDir[2]);
      const avgZ = backOuter.reduce((acc, p) => acc + p.wz, 0) / backOuter.length;
      const backHolesRev = backHoles.map((h) => [...h].reverse());
      allPolys.push({
        isCap: true,
        outer: backOuterRev,
        holes: backHolesRev,
        avgZ,
        diffuse: 0.45 + 0.55 * dot
      });
    }

    // Outer Side Quads: Correct outward winding [next, i, back_i, back_next] so facing sides never get culled
    const n = geom.outer.length;
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      const quad = [frontOuter[next], frontOuter[i], backOuter[i], backOuter[next]];
      if (polyArea2D(quad) > 0) {
        const norm = computeQuadNormal(quad[0], quad[1], quad[2]);
        const dot = Math.max(0, norm[0] * lightDir[0] + norm[1] * lightDir[1] + norm[2] * lightDir[2]);
        const avgZ = (quad[0].wz + quad[1].wz + quad[2].wz + quad[3].wz) / 4;
        allPolys.push({
          isCap: false,
          pts: quad,
          avgZ,
          diffuse: 0.45 + 0.55 * dot
        });
      }
    }

    // Inner Hole Side Quads: Correct outward-into-hole winding [i, next, back_next, back_i]
    frontHoles.forEach((fHole, hIdx) => {
      const bHole = backHoles[hIdx];
      const nh = fHole.length;
      for (let i = 0; i < nh; i++) {
        const next = (i + 1) % nh;
        const quad = [fHole[i], fHole[next], bHole[next], bHole[i]];
        if (polyArea2D(quad) > 0) {
          const norm = computeQuadNormal(quad[0], quad[1], quad[2]);
          const dot = Math.max(0, norm[0] * lightDir[0] + norm[1] * lightDir[1] + norm[2] * lightDir[2]);
          const avgZ = (quad[0].wz + quad[1].wz + quad[2].wz + quad[3].wz) / 4;
          allPolys.push({
            isCap: false,
            pts: quad,
            avgZ,
            diffuse: 0.45 + 0.55 * dot
          });
        }
      }
    });
  });

  // Strict Painter's Algorithm: draw furthest polygons first
  allPolys.sort((a, b) => a.avgZ - b.avgZ);

  allPolys.forEach((p) => {
    const { diffuse } = p;
    if (p.isCap) {
      // Main Letter Face (Bright, solid, high contrast)
      ctx.beginPath();
      ctx.moveTo(p.outer[0].sx, p.outer[0].sy);
      for (let i = 1; i < p.outer.length; i++) {
        ctx.lineTo(p.outer[i].sx, p.outer[i].sy);
      }
      ctx.closePath();

      p.holes.forEach((hole) => {
        ctx.moveTo(hole[0].sx, hole[0].sy);
        for (let i = 1; i < hole.length; i++) {
          ctx.lineTo(hole[i].sx, hole[i].sy);
        }
        ctx.closePath();
      });

      if (isLight) {
        ctx.fillStyle = `rgb(${Math.round(245 + 10 * diffuse)}, ${Math.round(245 + 10 * diffuse)}, ${Math.round(245 + 10 * diffuse)})`;
        ctx.strokeStyle = "#101012";
      } else {
        ctx.fillStyle = `rgb(${Math.round(210 + 35 * diffuse)}, ${Math.round(200 + 35 * diffuse)}, ${Math.round(185 + 35 * diffuse)})`;
        ctx.strokeStyle = "#080808";
      }

      ctx.fill("evenodd");
      ctx.lineWidth = 3.2;
      ctx.lineJoin = "round";
      ctx.stroke();
    } else {
      // Side Quad (3D Depth extrusion facet with lighting)
      ctx.beginPath();
      ctx.moveTo(p.pts[0].sx, p.pts[0].sy);
      for (let i = 1; i < p.pts.length; i++) {
        ctx.lineTo(p.pts[i].sx, p.pts[i].sy);
      }
      ctx.closePath();

      if (isLight) {
        ctx.fillStyle = `rgb(${Math.round(24 + 38 * diffuse)}, ${Math.round(24 + 38 * diffuse)}, ${Math.round(28 + 42 * diffuse)})`;
        ctx.strokeStyle = "#101012";
      } else {
        ctx.fillStyle = `rgb(${Math.round(16 + 32 * diffuse)}, ${Math.round(16 + 32 * diffuse)}, ${Math.round(20 + 36 * diffuse)})`;
        ctx.strokeStyle = "#080808";
      }

      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  });

  ctx.restore();
}

// Reusable Card Content: Text Card (Centered concise summary) or Image Card (Constancia Preview)
function CardInnerContent({ face, isBlurredBack = false }) {
  const { exp, Icon, num, invert, type } = face;
  const cardMuted = invert ? "rgba(8,8,8,0.72)" : "var(--fg-muted)";
  const cardBorder = invert ? "var(--bg)" : "var(--border-strong)";
  const dividerColor = invert ? "rgba(8,8,8,0.2)" : "var(--border-color)";

  if (type === "text") {
    return (
      <div
        className="w-full h-full flex flex-col justify-between"
        style={
          isBlurredBack
            ? { filter: "blur(2.5px)", opacity: 0.65 }
            : undefined
        }
      >
        <div>
          <div
            className="flex items-center justify-between pb-4 border-b"
            style={{ borderColor: dividerColor }}
          >
            <span className="text-xs font-mono uppercase tracking-widest font-bold">
              EXP // {num}
            </span>
            <span className="text-xs font-mono flex items-center gap-1.5 font-medium">
              <CalendarBlank size={14} />
              {exp.period}
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <span className="text-6xl font-black font-title leading-none tracking-tighter">
              {num}
            </span>
            <div
              className="w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm"
              style={{
                borderColor: cardBorder,
                backgroundColor: invert ? "var(--bg)" : "var(--fg)",
                color: invert ? "var(--fg)" : "var(--bg)"
              }}
            >
              <Icon size={28} weight="duotone" />
            </div>
          </div>

          <h3 className="mt-6 text-2xl font-bold font-title leading-tight">
            {exp.role}
          </h3>
          <p
            className="mt-1.5 text-xs font-mono uppercase tracking-wider font-semibold"
            style={{ color: cardMuted }}
          >
            {exp.company}
          </p>

          {/* Centered concise summary — clean and legible without walls of bullet points */}
          <div
            className="mt-6 pt-5 border-t text-sm leading-relaxed"
            style={{ borderColor: dividerColor, color: cardMuted }}
          >
            <p className="line-clamp-4 font-normal">
              {exp.summary || exp.bullets[0]}
            </p>
          </div>
        </div>

        <div
          className="pt-4 border-t flex items-center justify-between text-xs font-mono"
          style={{ borderColor: dividerColor }}
        >
          <span>{exp.location}</span>
          <span className="inline-flex items-center gap-1 font-bold uppercase">
            Detalle + Constancia
            <ArrowUpRight size={14} weight="bold" />
          </span>
        </div>
      </div>
    );
  }

  // Image Card (Constancia / Evidencia Preview)
  // Image / Document Preview Card (Pure document image across the entire card, zero text)
  if (exp.documentImage) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-white overflow-hidden select-none"
        style={
          isBlurredBack
            ? { filter: "blur(2.5px)", opacity: 0.65 }
            : undefined
        }
      >
        <img
          src={exp.documentImage}
          alt={`Constancia - ${exp.role}`}
          className="w-full h-full object-contain pointer-events-none select-none"
          loading="lazy"
        />
      </div>
    );
  }

  // Empty Card for Exp 6 (Proyectos en GitHub): "aqui no tenemos imagen asi que dejalo como vacio la tarjeta"
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center p-8 select-none"
      style={
        isBlurredBack
          ? { filter: "blur(2.5px)", opacity: 0.65 }
          : undefined
      }
    >
      <div
        className="w-20 h-20 rounded-3xl border-2 border-dashed flex items-center justify-center opacity-30 mb-3"
        style={{ borderColor: cardBorder }}
      >
        <GithubLogo size={44} weight="regular" />
      </div>
      <span className="text-xs font-mono uppercase tracking-widest opacity-35">
        github.com/AndreeHappy
      </span>
    </div>
  );
}

// 3D Cylinder Ring with 6 faces (3 Experiences * 2 paired cards each)
function CylinderRing({ faces, ringRef, innerRef, onSelectCard }) {
  const radius = 660;

  return (
    <div
      ref={ringRef}
      className="absolute left-1/2 top-1/2 w-0 h-0 will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        ref={innerRef}
        className="absolute left-0 top-0 w-0 h-0 will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {faces.map((face, idx) => {
          const angle = idx * (360 / faces.length);
          const { exp, invert } = face;

          const isDocCard = face.type === "image" && exp.documentImage;

          const cardBg = isDocCard
            ? "#ffffff"
            : invert
            ? "var(--fg)"
            : "var(--bg-card)";
          const cardFg = invert ? "var(--bg)" : "var(--fg)";
          const cardBorder = isDocCard
            ? "var(--border-strong)"
            : invert
            ? "var(--bg)"
            : "var(--border-strong)";

          return (
            <div
              key={idx}
              onClick={() => onSelectCard(exp)}
              className="absolute w-[460px] h-[610px] -left-[230px] -top-[305px] cursor-pointer select-none group transition-transform duration-300 hover:scale-[1.02]"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Front Face */}
              <div
                className={`absolute inset-0 rounded-[28px] border-2 overflow-hidden shadow-2xl ${
                  isDocCard ? "p-0" : "p-8"
                }`}
                style={{
                  transform: "translateZ(1px)",
                  backfaceVisibility: "hidden",
                  backgroundColor: cardBg,
                  color: cardFg,
                  borderColor: cardBorder
                }}
              >
                <CardInnerContent face={face} isBlurredBack={false} />
              </div>

              {/* Back Face (Rotated 180° with blurred card info) */}
              <div
                className={`absolute inset-0 rounded-[28px] border-2 overflow-hidden ${
                  isDocCard ? "p-0" : "p-8"
                }`}
                style={{
                  transform: "rotateY(180deg) translateZ(1px)",
                  backfaceVisibility: "hidden",
                  backgroundColor: cardBg,
                  color: cardFg,
                  borderColor: cardBorder
                }}
              >
                <CardInnerContent face={face} isBlurredBack={true} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Experience() {
  const sectionRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring1InnerRef = useRef(null);
  const ring2InnerRef = useRef(null);
  const canvas3DRef = useRef(null);
  const manualAngleRef = useRef(0);
  const [selectedExp, setSelectedExp] = useState(null);

  useEffect(() => {
    if (!selectedExp) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedExp(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedExp]);

  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      const r1 = ring1Ref.current;
      const r2 = ring2Ref.current;
      const canvasEl = canvas3DRef.current;
      if (!sectionEl || !r1 || !r2 || !canvasEl) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.set(r1, {
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0
        });

        gsap.set(r2, {
          y: 1080,
          z: 0,
          rotationX: 0,
          rotationY: 120
        });

        let targetProgress = 0;
        let smoothProgress = 0;
        let isSectionInView = false;
        let isTicking = false;

        drawSolid3DLetters(canvasEl, 0, 0);

        const tick = () => {
          smoothProgress += (targetProgress - smoothProgress) * 0.085;
          drawSolid3DLetters(canvasEl, smoothProgress, gsap.ticker.time);
        };

        const updateTickerState = () => {
          if (isSectionInView && !isTicking) {
            isTicking = true;
            gsap.ticker.add(tick);
          } else if (!isSectionInView && isTicking) {
            isTicking = false;
            gsap.ticker.remove(tick);
          }
        };

        const observer = new IntersectionObserver(
          ([entry]) => {
            isSectionInView = entry.isIntersecting;
            updateTickerState();
          },
          { rootMargin: "180px" }
        );
        observer.observe(sectionEl);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionEl,
            start: "top top",
            end: "+=3600",
            pin: true,
            pinSpacing: true,
            scrub: 1.0,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              targetProgress = self.progress;
            }
          }
        });

        // PHASE 1 (0 -> 1.2): Ring 1 rotates clockwise
        tl.to(
          r1,
          {
            rotationY: -180,
            ease: "none",
            duration: 1.2
          },
          0
        );

        // PHASE 2 (1.2 -> 2.4): Ring 1 rises up, solid 3D "A A S A" letters tumble through the center, Ring 2 rises from below
        tl.to(
          r1,
          {
            y: -1080,
            rotationY: -300,
            ease: "none",
            duration: 1.2
          },
          1.2
        );

        tl.to(
          r2,
          {
            y: 0,
            rotationY: 0,
            ease: "none",
            duration: 1.2
          },
          1.2
        );

        // PHASE 3 (2.4 -> 3.6): Ring 2 rotates clockwise in center
        tl.to(
          r2,
          {
            rotationY: -180,
            ease: "none",
            duration: 1.2
          },
          2.4
        );

        return () => {
          observer.disconnect();
          if (isTicking) gsap.ticker.remove(tick);
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const rotateCylinderHorizontally = (dir) => {
    manualAngleRef.current += dir * -60;
    gsap.to([ring1InnerRef.current, ring2InnerRef.current], {
      rotationY: manualAngleRef.current,
      duration: 0.75,
      ease: "power3.out",
      overwrite: "auto"
    });
  };

  return (
    <section
      id="experiencia"
      ref={sectionRef}
      className="relative w-full min-h-screen md:h-screen border-t overflow-hidden md:overflow-hidden flex items-center justify-center py-14 md:py-0"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--border-color)",
        color: "var(--fg)"
      }}
    >
      {/* CAD Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px"
        }}
      />

      {/* Desktop Unified 3D Scene */}
      <div
        className="hidden md:flex relative w-full h-full items-center justify-center"
        style={{
          perspective: "2400px",
          perspectiveOrigin: "50% 50%"
        }}
      >
        <div
          className="relative w-0 h-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(-420px)"
          }}
        >
          {/* Ring 1 (Experiences 1, 2, 3: Text + Image pairs) */}
          <CylinderRing
            faces={ring1Faces}
            ringRef={ring1Ref}
            innerRef={ring1InnerRef}
            onSelectCard={setSelectedExp}
          />

          {/* Solid Watertight 3D Extruded "A A S A" Letters at Z=0 (Center of the Cylinder Tube) */}
          <canvas
            ref={canvas3DRef}
            className="pointer-events-none absolute w-[1000px] h-[1000px] -left-[500px] -top-[500px]"
            style={{
              transform: "translateZ(0px)"
            }}
          />

          {/* Ring 2 (Experiences 4, 5, 6: Text + Image pairs) */}
          <CylinderRing
            faces={ring2Faces}
            ringRef={ring2Ref}
            innerRef={ring2InnerRef}
            onSelectCard={setSelectedExp}
          />
        </div>

        {/* Left & Right Circular Arrow Buttons */}
        <button
          onClick={() => rotateCylinderHorizontally(-1)}
          aria-label="Girar cilindro a la izquierda"
          className="absolute left-6 z-40 w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{
            backgroundColor: "var(--bg)",
            borderColor: "var(--border-strong)",
            color: "var(--fg)"
          }}
        >
          <CaretLeft size={20} weight="bold" />
        </button>

        <button
          onClick={() => rotateCylinderHorizontally(1)}
          aria-label="Girar cilindro a la derecha"
          className="absolute right-6 z-40 w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{
            backgroundColor: "var(--bg)",
            borderColor: "var(--border-strong)",
            color: "var(--fg)"
          }}
        >
          <CaretRight size={20} weight="bold" />
        </button>
      </div>

      {/* Mobile Fallback: Natural document scrolling with clear section title */}
      <div className="md:hidden relative z-20 w-full max-w-lg mx-auto flex flex-col gap-6 px-4">
        <div className="mb-1">
          <span className="text-xs font-mono tracking-widest uppercase opacity-60">
            02 // TRAYECTORIA
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-title mt-1">
            Experiencia Profesional
          </h2>
        </div>

        {experiencesList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedExp(item)}
            className="rounded-2xl border p-5 flex flex-col gap-3 cursor-pointer transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: idx % 2 === 1 ? "var(--fg)" : "var(--bg-card)",
              color: idx % 2 === 1 ? "var(--bg)" : "var(--fg)",
              borderColor: "var(--border-strong)"
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span>0{idx + 1}</span>
              <span>{item.period}</span>
            </div>
            <h3 className="text-xl font-bold font-title">{item.role}</h3>
            <p className="text-xs opacity-80 font-mono font-medium">{item.company}</p>
            <p className="text-xs leading-relaxed opacity-90 line-clamp-2">
              {item.summary || item.bullets[0]}
            </p>
            {item.documentImage && (
              <div className="w-full h-32 rounded-xl overflow-hidden border p-1 bg-black/10 mt-1">
                <img
                  src={item.documentImage}
                  alt={item.role}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="pt-2 border-t flex items-center justify-between text-[11px] font-mono mt-1 opacity-75">
              <span>{item.location}</span>
              <span className="font-bold uppercase">Ver detalle y constancia →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Animated Fusion Modal View (Left Card: Detailed Info + Right Card: Constancia / Evidencia) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedExp && (
              <div
                onClick={() => setSelectedExp(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 20 }}
                  transition={{ type: "spring", damping: 26, stiffness: 240 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto border-2 rounded-[28px] sm:rounded-[32px] shadow-2xl my-auto grid grid-cols-1 lg:grid-cols-2"
                  style={{
                    backgroundColor: "var(--bg)",
                borderColor: "var(--border-strong)",
                color: "var(--fg)"
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedExp(null)}
                aria-label="Cerrar modal"
                className="absolute top-5 right-5 z-20 p-2.5 rounded-full border cursor-pointer transition-transform hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border-strong)",
                  color: "var(--fg)"
                }}
              >
                <X size={20} weight="bold" />
              </button>

              {/* Panel 1: Detailed Professional Experience Card */}
              <div
                className="p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div>
                  <div
                    className="flex items-center justify-between pb-4 border-b text-xs font-mono"
                    style={{ borderColor: "var(--border-color)", color: "var(--fg-muted)" }}
                  >
                    <span className="font-bold uppercase tracking-widest">
                      DETALLE DE EXPERIENCIA
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CalendarBlank size={14} />
                      {selectedExp.period}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-title mt-4 leading-tight">
                    {selectedExp.role}
                  </h3>
                  <p
                    className="text-sm mt-1.5 font-medium"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {selectedExp.company} • {selectedExp.location}
                  </p>

                  <div
                    className="mt-6 border-t pt-5"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <h4
                      className="text-xs font-mono uppercase tracking-wider mb-4 font-bold"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      Actividades, Responsabilidades y Logros:
                    </h4>
                    <ul className="space-y-3.5">
                      {selectedExp.bullets.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm leading-relaxed flex items-start gap-3"
                        >
                          <CheckCircle
                            size={18}
                            className="mt-0.5 flex-shrink-0"
                            weight="duotone"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  className="mt-8 pt-4 border-t flex items-center justify-between text-xs font-mono"
                  style={{ borderColor: "var(--border-color)", color: "var(--fg-muted)" }}
                >
                  <span>Andree Aarom Sosa Ardiles</span>
                  <span>{selectedExp.period}</span>
                </div>
              </div>

              {/* Panel 2: Official Document / Evidence Card */}
              <div
                className="p-6 sm:p-10 flex flex-col justify-between"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <div
                  className="flex items-center justify-between pb-4 border-b text-xs font-mono"
                  style={{ borderColor: "var(--border-color)", color: "var(--fg-muted)" }}
                >
                  <span className="font-bold uppercase tracking-widest">
                    CONSTANCIA / EVIDENCIA OFICIAL
                  </span>
                  <span>VERIFICACIÓN TI</span>
                </div>

                <div className="my-auto py-4 flex flex-col items-center justify-center">
                  {selectedExp.documentImage ? (
                    <div className="w-full flex flex-col items-center">
                      <div
                        className="w-full max-h-[440px] rounded-2xl overflow-hidden border p-2 flex items-center justify-center shadow-xl"
                        style={{
                          borderColor: "var(--border-strong)",
                          backgroundColor: "var(--bg)"
                        }}
                      >
                        <img
                          src={selectedExp.documentImage}
                          alt={`Constancia oficial - ${selectedExp.role}`}
                          className="w-full max-h-[410px] object-contain rounded-xl"
                        />
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <a
                          href={selectedExp.documentImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-transform hover:scale-105 cursor-pointer shadow-md"
                          style={{
                            backgroundColor: "var(--fg)",
                            color: "var(--bg)",
                            borderColor: "var(--fg)"
                          }}
                        >
                          <MagnifyingGlassPlus size={16} weight="bold" />
                          <span>Ver documento en alta resolución ↗</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 flex flex-col items-center">
                      <div
                        className="w-20 h-20 rounded-3xl border-2 flex items-center justify-center mb-5"
                        style={{ borderColor: "var(--border-strong)" }}
                      >
                        <GithubLogo size={46} weight="duotone" />
                      </div>
                      <h4 className="text-xl font-bold font-title">
                        Proyectos en GitHub
                      </h4>
                      <p
                        className="text-xs mt-2 max-w-sm font-medium leading-relaxed"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        Demostraciones de código, scripts de automatización con Python, modelos de analítica y repositorios públicos.
                      </p>
                      <a
                        href="https://github.com/AndreeHappy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-transform hover:scale-105 cursor-pointer shadow-md"
                        style={{
                          backgroundColor: "var(--fg)",
                          color: "var(--bg)",
                          borderColor: "var(--fg)"
                        }}
                      >
                        <ArrowUpRight size={16} weight="bold" />
                        <span>Explorar Repositorio @AndreeHappy ↗</span>
                      </a>
                    </div>
                  )}
                </div>

                <div
                  className="pt-4 border-t flex items-center justify-between text-xs font-mono"
                  style={{ borderColor: "var(--border-color)", color: "var(--fg-muted)" }}
                >
                  <span>{selectedExp.company}</span>
                  <span>Constancia Digital</span>
                </div>
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
