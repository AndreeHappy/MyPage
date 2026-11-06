import React from "react";

// Chunky geometric letters (Adumu / collegiate faceted blocky style)
const LOGO_GEOMETRY = {
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

// 2x2 Matrix "AASA" Chunky 3D Monogram Logo
// Row 0: A  A
// Row 1: S  A
export default function AASALogo({ scale = 1, isLightMode = false }) {
  const items = [
    { char: "A", row: 0, col: 0 },
    { char: "A", row: 0, col: 1 },
    { char: "S", row: 1, col: 0 },
    { char: "A", row: 1, col: 1 }
  ];

  const width = 56;
  const height = 58;
  const cx = width / 2;
  const cy = height / 2;
  const scaleXY = 11.5;
  const halfDepth = 1.6;
  const fov = 600;

  // Adaptive palette
  const faceFill = isLightMode ? "#080808" : "#E3DAC9";
  const edgeStroke = isLightMode ? "#E3DAC9" : "#080808";
  const depthFill = isLightMode ? "#d5cbb5" : "#1a1a1a";
  const backFill = isLightMode ? "#c4b89f" : "#080808";

  // Isometric angle with subtle architectural relief
  const rx = -0.09;
  const ry = 0.12;
  const rz = 0;

  const jobs = items.map((item, idx) => {
    // Tight 2x2 grid spacing
    const posX = (item.col - 0.5) * (scaleXY * 1.82);
    const posY = (item.row - 0.5) * (scaleXY * 2.16);
    const geom = LOGO_GEOMETRY[item.char];

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
        const wz = rzPt;
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
      key: `${item.char}-${idx}`,
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
      aria-label="AASA Monogram Logo"
      className="pointer-events-none select-none overflow-visible"
    >
      {jobs.map((job) => (
        <g key={job.key}>
          {/* 3D Back Cap */}
          <path
            d={job.farCapPath}
            fill={backFill}
            fillRule="evenodd"
            stroke={backFill}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* 3D Extruded Sides */}
          {job.sideQuads.map((q, qIdx) => (
            <path
              key={qIdx}
              d={q.d}
              fill={depthFill}
              stroke={edgeStroke}
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          ))}
          {/* Front Face with Contrasting Border */}
          <path
            d={job.nearCapPath}
            fill={faceFill}
            fillRule="evenodd"
            stroke={edgeStroke}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
