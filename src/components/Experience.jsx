import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  CheckCircle,
  Database,
  Desktop,
  Browsers,
  FileXls,
  Cpu,
  TerminalWindow,
  ArrowUpRight,
  X
} from "@phosphor-icons/react";
import profileData from "../data/profile.json";

gsap.registerPlugin(ScrollTrigger);

const roleIcons = [Database, Cpu, Desktop, Browsers, FileXls, TerminalWindow];
const experiencesList = profileData?.experience || [];

function buildCylinderRing(experiencesSlice, ringOffsetIndex) {
  const faces = [];
  experiencesSlice.forEach((exp, idx) => {
    const globalNum = ringOffsetIndex + idx + 1;
    const Icon = roleIcons[(globalNum - 1) % roleIcons.length];
    faces.push({
      type: "primary",
      num: `0${globalNum}`,
      exp,
      Icon,
      invert: idx % 2 === 1
    });
    faces.push({
      type: "spec",
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

// 2D Polygon Contours for True Watertight 3D Extruded Letters "A" and "S"
const LETTER_GEOMETRY = {
  A: {
    outer: [
      [-0.22, -1.0],
      [0.22, -1.0],
      [0.86, 1.0],
      [0.4, 1.0],
      [0.25, 0.44],
      [-0.25, 0.44],
      [-0.4, 1.0],
      [-0.86, 1.0]
    ],
    holes: [
      [
        [0.0, -0.48],
        [0.18, 0.08],
        [-0.18, 0.08]
      ]
    ]
  },
  S: {
    outer: [
      [-0.72, -1.0],
      [0.72, -1.0],
      [0.72, -0.58],
      [-0.26, -0.58],
      [-0.26, -0.18],
      [0.72, -0.18],
      [0.72, 1.0],
      [-0.72, 1.0],
      [-0.72, 0.58],
      [0.26, 0.58],
      [0.26, 0.18],
      [-0.72, 0.18]
    ],
    holes: []
  }
};

// Rotate a 3D point [x, y, z] by Euler angles (rx, ry, rz) in radians
function rotate3D(pt, rx, ry, rz) {
  let [x, y, z] = pt;

  // Rotate X
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;
  y = y1;
  z = z1;

  // Rotate Y
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x2 = x * cosY + z * sinY;
  const z2 = -x * sinY + z * cosY;
  x = x2;
  z = z2;

  // Rotate Z
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const x3 = x * cosZ - y * sinZ;
  const y3 = x * sinZ + y * cosZ;

  return [x3, y3, z];
}

// Render the 4 solid 3D letters "A", "S", "A", "A" in a vertical cascade with continuous 3D spin
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

  // Hide completely at exact start (progress <= 0.015) and exact end (progress >= 0.985)
  if (progress <= 0.015 || progress >= 0.985) {
    ctx.restore();
    return;
  }

  // Smooth fade in at top and fade out at bottom
  let alpha = 1;
  if (progress < 0.12) alpha = (progress - 0.015) / 0.105;
  else if (progress > 0.88) alpha = (0.985 - progress) / 0.105;
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Vertical column arrangement (A -> A -> S -> A from top to bottom)
  const letters = [
    {
      char: "A",
      baseX: -24,
      offsetY: -255,
      phase: 0.0,
      spinDir: 1
    },
    {
      char: "A",
      baseX: 24,
      offsetY: -85,
      phase: 1.4,
      spinDir: -1
    },
    {
      char: "S",
      baseX: -24,
      offsetY: 85,
      phase: 2.8,
      spinDir: 1
    },
    {
      char: "A",
      baseX: 24,
      offsetY: 255,
      phase: 4.2,
      spinDir: -1
    }
  ];

  const fov = 1100;
  const cx = width / 2;
  const cy = height / 2;
  const scaleXY = 64;
  const halfDepth = 26; // Solid 52px 3D block thickness

  // Group vertical center moves smoothly from top (-680px) through center (0px) to bottom (+680px)
  const groupY = -680 + progress * 1360;

  const letterDrawJobs = letters.map((item) => {
    const posY =
      groupY + item.offsetY + Math.sin(timeSec * 1.4 + item.phase) * 8;
    const posX =
      item.baseX + Math.cos(timeSec * 1.1 + item.phase) * 14;
    const posZ = Math.sin(timeSec * 1.2 + item.phase) * 20;

    // Continuous smooth rotation in place + gentle scroll-driven turn
    const ry =
      timeSec * 1.15 * item.spinDir +
      progress * Math.PI * 1.6 * item.spinDir +
      item.phase;
    const rx =
      Math.sin(timeSec * 1.5 + item.phase) * 0.42 +
      Math.cos(progress * Math.PI * 2 + item.phase) * 0.18;
    const rz =
      Math.cos(timeSec * 1.2 + item.phase) * 0.22;

    const geom = LETTER_GEOMETRY[item.char];

    const projectRing = (ring2D, zLocal) =>
      ring2D.map(([vx, vy]) => {
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
          wz
        };
      });

    const frontOuter = projectRing(geom.outer, halfDepth);
    const backOuter = projectRing(geom.outer, -halfDepth);
    const frontHoles = geom.holes.map((h) => projectRing(h, halfDepth));
    const backHoles = geom.holes.map((h) => projectRing(h, -halfDepth));

    // Side Wall Quads for this letter
    const sideQuads = [];
    const addSideQuads = (frontPts, backPts) => {
      const n = frontPts.length;
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        const p0 = frontPts[i];
        const p1 = frontPts[next];
        const p2 = backPts[next];
        const p3 = backPts[i];
        const avgZ = (p0.wz + p1.wz + p2.wz + p3.wz) / 4;
        sideQuads.push({
          pts: [p0, p1, p2, p3],
          avgZ
        });
      }
    };

    addSideQuads(frontOuter, backOuter);
    frontHoles.forEach((fHole, hIdx) => {
      addSideQuads(fHole, backHoles[hIdx]);
    });

    // Sort this letter's side walls back-to-front
    sideQuads.sort((a, b) => a.avgZ - b.avgZ);

    // Determine which cap faces the perspective camera at (0, 0, fov)
    const [nx, ny, nz] = rotate3D([0, 0, 1], rx, ry, rz);
    const dotCamera = nx * -posX + ny * -posY + nz * (fov - posZ);
    const frontFacesCamera = dotCamera >= 0;

    const frontCap = { outer: frontOuter, holes: frontHoles };
    const backCap = { outer: backOuter, holes: backHoles };

    return {
      posZ,
      farCap: frontFacesCamera ? backCap : frontCap,
      nearCap: frontFacesCamera ? frontCap : backCap,
      sideQuads
    };
  });

  // Sort letters from farthest Z to nearest Z
  letterDrawJobs.sort((a, b) => a.posZ - b.posZ);

  const drawCap = (cap) => {
    ctx.beginPath();
    ctx.moveTo(cap.outer[0].sx, cap.outer[0].sy);
    for (let i = 1; i < cap.outer.length; i++) {
      ctx.lineTo(cap.outer[i].sx, cap.outer[i].sy);
    }
    ctx.closePath();

    cap.holes.forEach((hole) => {
      ctx.moveTo(hole[0].sx, hole[0].sy);
      for (let i = 1; i < hole.length; i++) {
        ctx.lineTo(hole[i].sx, hole[i].sy);
      }
      ctx.closePath();
    });

    ctx.fillStyle = "#E3DAC9";
    ctx.fill("evenodd");
    ctx.lineWidth = 3.5;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#080808";
    ctx.stroke();
  };

  // For each letter: 1) Far Cap -> 2) Extruded Side Walls -> 3) Camera-facing Near Cap LAST (guarantees zero clipping!)
  letterDrawJobs.forEach((job) => {
    drawCap(job.farCap);

    job.sideQuads.forEach((quad) => {
      ctx.beginPath();
      ctx.moveTo(quad.pts[0].sx, quad.pts[0].sy);
      for (let i = 1; i < quad.pts.length; i++) {
        ctx.lineTo(quad.pts[i].sx, quad.pts[i].sy);
      }
      ctx.closePath();
      ctx.fillStyle = "#080808";
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(227, 218, 201, 0.38)";
      ctx.stroke();
    });

    drawCap(job.nearCap);
  });

  ctx.restore();
}

// Reusable Card Content (used on both the sharp Front Face and the blurred Back Face)
function CardInnerContent({ face, isBlurredBack = false }) {
  const { exp, Icon, num, invert, type } = face;
  const cardMuted = invert ? "rgba(8,8,8,0.72)" : "var(--fg-muted)";
  const cardBorder = invert ? "var(--bg)" : "var(--border-strong)";
  const dividerColor = invert ? "rgba(8,8,8,0.2)" : "var(--border-color)";

  if (type === "primary") {
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
            <span className="text-xs font-mono flex items-center gap-1.5">
              <CalendarBlank size={14} />
              {exp.period}
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <span className="text-6xl font-black font-title leading-none tracking-tighter">
              {num}
            </span>
            <div
              className="w-14 h-14 rounded-2xl border flex items-center justify-center"
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

          <ul
            className="mt-5 space-y-3 pt-4 border-t"
            style={{ borderColor: dividerColor }}
          >
            {exp.bullets.slice(0, 2).map((b, bIdx) => (
              <li
                key={bIdx}
                className="text-xs leading-relaxed flex items-start gap-2.5"
                style={{ color: cardMuted }}
              >
                <span className="font-bold mt-0.5">▪</span>
                <span className="line-clamp-4">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="pt-4 border-t flex items-center justify-between text-xs font-mono"
          style={{ borderColor: dividerColor }}
        >
          <span>{exp.location}</span>
          <span className="inline-flex items-center gap-1 font-bold uppercase">
            Detalle
            <ArrowUpRight size={14} weight="bold" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col justify-between"
      style={
        isBlurredBack
          ? { filter: "blur(2.5px)", opacity: 0.65 }
          : undefined
      }
    >
      <div
        className="flex items-center justify-between pb-4 border-b"
        style={{ borderColor: dividerColor }}
      >
        <span className="text-xs font-mono uppercase tracking-widest">
          SYS // {num}
        </span>
        <span className="text-xs font-mono">AASA</span>
      </div>

      <div className="my-auto flex flex-col items-center justify-center text-center py-4">
        <div
          className="w-24 h-24 rounded-3xl border-2 flex items-center justify-center mb-5"
          style={{ borderColor: cardBorder }}
        >
          <Icon size={54} weight="duotone" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest opacity-70">
          {exp.location}
        </span>
        <h4 className="text-xl font-bold font-title mt-2">
          {exp.company}
        </h4>
        <p
          className="text-xs mt-3 leading-relaxed max-w-[34ch]"
          style={{ color: cardMuted }}
        >
          {exp.bullets[2] || exp.bullets[0]}
        </p>
      </div>

      <div
        className="pt-4 border-t flex items-center justify-between text-xs font-mono"
        style={{ borderColor: dividerColor }}
      >
        <span>{num}</span>
        <span>{exp.period}</span>
      </div>
    </div>
  );
}

// Clean 3D Cylinder Ring (Single crisp card block without multi-card slice lines)
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

          const cardBg = invert ? "var(--fg)" : "var(--bg-card)";
          const cardFg = invert ? "var(--bg)" : "var(--fg)";
          const cardBorder = invert ? "var(--bg)" : "var(--border-strong)";

          return (
            <div
              key={idx}
              onClick={() => onSelectCard(exp)}
              className="absolute w-[460px] h-[610px] -left-[230px] -top-[305px] cursor-pointer select-none"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Front Face */}
              <div
                className="absolute inset-0 rounded-[28px] border-2 p-8 overflow-hidden shadow-2xl"
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
                className="absolute inset-0 rounded-[28px] border-2 p-8 overflow-hidden"
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

        // Initial clear of 3D ASAA canvas (progress = 0 -> hidden)
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

        // NO snap property: wherever the user stops scrolling, it stays right there!
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

        // PHASE 2 (1.2 -> 2.4): Ring 1 rises up, solid 3D "A S A A" letters tumble through the center, Ring 2 rises from below
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

  // Left & Right Arrow Buttons ONLY rotate the cylinder horizontally without scrolling the page
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
      className="relative w-full h-screen border-t overflow-hidden flex items-center justify-center"
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
          {/* Ring 1 (Perimeter at R=660px) */}
          <CylinderRing
            faces={ring1Faces}
            ringRef={ring1Ref}
            innerRef={ring1InnerRef}
            onSelectCard={setSelectedExp}
          />

          {/* Solid Watertight 3D Extruded "A S A A" Letters at Z=0 (Center of the Cylinder Tube) */}
          <canvas
            ref={canvas3DRef}
            className="pointer-events-none absolute w-[1000px] h-[1000px] -left-[500px] -top-[500px]"
            style={{
              transform: "translateZ(0px)"
            }}
          />

          {/* Ring 2 (Perimeter at R=660px) */}
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

      {/* Mobile Fallback */}
      <div className="md:hidden relative z-20 w-full max-w-lg mx-auto grid grid-cols-1 gap-5 px-4 py-12 overflow-y-auto max-h-screen">
        {experiencesList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedExp(item)}
            className="rounded-2xl border p-6 flex flex-col gap-3 cursor-pointer"
            style={{
              backgroundColor: idx % 2 === 1 ? "var(--fg)" : "var(--bg-card)",
              color: idx % 2 === 1 ? "var(--bg)" : "var(--fg)",
              borderColor: "var(--border-strong)"
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span>0{idx + 1}</span>
              <span>{item.period}</span>
            </div>
            <h3 className="text-lg font-bold font-title">{item.role}</h3>
            <p className="text-xs opacity-80">{item.company}</p>
          </div>
        ))}
      </div>

      {/* Modal Detail View */}
      {selectedExp && (
        <div
          onClick={() => setSelectedExp(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl"
            style={{
              backgroundColor: "var(--bg)",
              borderColor: "var(--border-strong)",
              color: "var(--fg)"
            }}
          >
            <button
              onClick={() => setSelectedExp(null)}
              className="absolute top-6 right-6 p-2 rounded-full border cursor-pointer"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--fg)"
              }}
            >
              <X size={20} />
            </button>

            <span
              className="text-xs font-mono uppercase tracking-widest"
              style={{ color: "var(--fg-muted)" }}
            >
              {selectedExp.period}
            </span>
            <h3 className="text-2xl font-bold font-title mt-1">
              {selectedExp.role}
            </h3>
            <p
              className="text-sm mt-1 font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              {selectedExp.company} • {selectedExp.location}
            </p>

            <div
              className="mt-6 border-t pt-4"
              style={{ borderColor: "var(--border-color)" }}
            >
              <h4
                className="text-xs font-mono uppercase tracking-wider mb-3"
                style={{ color: "var(--fg-muted)" }}
              >
                Actividades y Logros:
              </h4>
              <ul className="space-y-3">
                {selectedExp.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="text-sm leading-relaxed flex items-start gap-3"
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
        </div>
      )}
    </section>
  );
}
