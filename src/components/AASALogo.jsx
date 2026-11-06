import React from "react";

const LOGO_GEOMETRY = {
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

function rotatePoint3D([x, y, z], rx, ry, rz) {
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x2 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;

  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  return [x2 * cosZ - y1 * sinZ, x2 * sinZ + y1 * cosZ, z2];
}

function pointsToPath(pts) {
  return (
    pts
      .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.sx.toFixed(2)},${p.sy.toFixed(2)}`)
      .join(" ") + " Z"
  );
}

// Flatter, tighter static "AASA" logo mark (subtle relief, compact spacing, adaptive to light/dark mode)
export default function AASALogo({ scale = 1, isLightMode = false }) {
  const chars = ["A", "A", "S", "A"];
  const width = 124;
  const height = 38;
  const cx = width / 2;
  const cy = height / 2 + 1;
  const scaleXY = 12.5;
  const halfDepth = 2.0; // Subtle, flatter relief (not overly 3D)
  const fov = 700;

  // Adaptive palette
  const faceFill = isLightMode ? "#080808" : "#E3DAC9";
  const edgeStroke = isLightMode ? "#E3DAC9" : "#080808";
  const depthFill = isLightMode ? "#2a2a2a" : "#080808";

  // Nearly front-facing with a subtle architectural relief angle
  const rx = -0.08;
  const ry = 0.12;
  const rz = 0;

  const jobs = chars.map((char, idx) => {
    // Tighter horizontal kerning (22.5px spacing between letter centers)
    const posX = (idx - 1.5) * 22.5;
    const posY = 0;
    const posZ = 0;
    const geom = LOGO_GEOMETRY[char];

    const projectRing = (ring2D, zLocal) =>
      ring2D.map(([vx, vy]) => {
        const [rxPt, ryPt, rzPt] = rotatePoint3D(
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

    const sideQuads = [];
    const addSideQuads = (frontPts, backPts) => {
      const n = frontPts.length;
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        const p0 = frontPts[i];
        const p1 = frontPts[next];
        const p2 = backPts[next];
        const p3 = backPts[i];
        sideQuads.push({
          d: pointsToPath([p0, p1, p2, p3]),
          avgZ: (p0.wz + p1.wz + p2.wz + p3.wz) / 4
        });
      }
    };

    addSideQuads(frontOuter, backOuter);
    frontHoles.forEach((fHole, hIdx) => addSideQuads(fHole, backHoles[hIdx]));
    sideQuads.sort((a, b) => a.avgZ - b.avgZ);

    const capToPath = (outer, holes) =>
      [pointsToPath(outer), ...holes.map(pointsToPath)].join(" ");

    return {
      key: `${char}-${idx}`,
      farCapPath: capToPath(backOuter, backHoles),
      nearCapPath: capToPath(frontOuter, frontHoles),
      sideQuads
    };
  });

  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      aria-label="AASA Logo"
      className="pointer-events-none select-none overflow-visible"
    >
      {jobs.map((job) => (
        <g key={job.key}>
          <path
            d={job.farCapPath}
            fill={depthFill}
            fillRule="evenodd"
            stroke={depthFill}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          {job.sideQuads.map((q, qIdx) => (
            <path
              key={qIdx}
              d={q.d}
              fill={depthFill}
              stroke={depthFill}
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
          ))}
          <path
            d={job.nearCapPath}
            fill={faceFill}
            fillRule="evenodd"
            stroke={edgeStroke}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
