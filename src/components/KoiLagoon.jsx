import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const NUM_SPINE = 22;
const BODY_SEGS = 16; // 0..15 is seamless body, 15..21 is flowing forked tail
const TRAIL_LENGTH = 360;

// Sculpted Koi body width profile (16 body segments: rounded snout -> plump belly -> tapered peduncle)
const KOI_RADIUS_PROFILE = [
  0.48, 0.7, 0.86, 0.98, 1.05, 1.04, 0.96, 0.85, 0.73, 0.6, 0.48, 0.37, 0.28,
  0.21, 0.16, 0.14
];

function getKoiRadius(i) {
  return KOI_RADIUS_PROFILE[i] ?? 0.14;
}

// Draw a smooth closed curve through an array of 2D points using quadratic midpoints
function traceSmoothClosedPolygon(ctx, pts) {
  const n = pts.length;
  if (n < 3) return;
  ctx.beginPath();
  ctx.moveTo(
    (pts[n - 1].x + pts[0].x) * 0.5,
    (pts[n - 1].y + pts[0].y) * 0.5
  );

  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const next = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) * 0.5, (p.y + next.y) * 0.5);
  }
  ctx.closePath();
}

function createKoi({ x, y, angle, scale, speed, variant, phase, spots }) {
  const segLen = 11.5 * scale;
  const trail = [];
  for (let k = 0; k < TRAIL_LENGTH; k++) {
    trail.push({
      x: x - Math.cos(angle) * k * speed,
      y: y - Math.sin(angle) * k * speed,
      angle
    });
  }

  const spine = [];
  for (let i = 0; i < NUM_SPINE; i++) {
    spine.push({
      x: x - Math.cos(angle) * i * segLen,
      y: y - Math.sin(angle) * i * segLen,
      angle
    });
  }

  return {
    x,
    y,
    angle,
    curvature: (phase % 2 === 0 ? 1 : -1) * 0.003,
    targetCurvature: 0.003,
    wanderTimer: Math.floor(phase * 40),
    scareBoost: 0,
    scareAngle: angle,
    swimPhase: phase,
    scale,
    segLen,
    speed,
    variant,
    phase,
    spots,
    trail,
    spine
  };
}

function updateKoiSpineFromTrail(koi) {
  const { trail, spine, segLen, swimPhase } = koi;
  let trailIdx = 0;
  let accumDist = 0;
  const maxTrailIdx = trail.length - 2;
  const boostAmp = 1 + koi.scareBoost * 0.35;

  for (let i = 0; i < NUM_SPINE; i++) {
    const targetDist = i * segLen;
    while (trailIdx < maxTrailIdx && accumDist < targetDist) {
      const pA = trail[trailIdx];
      const pB = trail[trailIdx + 1];
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      accumDist += Math.sqrt(dx * dx + dy * dy);
      trailIdx++;
    }

    let basePt;
    if (trailIdx >= maxTrailIdx && accumDist < targetDist) {
      const pA = trail[Math.max(0, maxTrailIdx - 1)];
      const pB = trail[maxTrailIdx];
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const step = Math.sqrt(dx * dx + dy * dy) || 1;
      const overDist = targetDist - accumDist;
      basePt = {
        x: pB.x + (dx / step) * overDist,
        y: pB.y + (dy / step) * overDist,
        angle: pB.angle
      };
    } else {
      basePt = trail[trailIdx];
    }

    const s = i / (NUM_SPINE - 1);
    const waveAmp = (2.2 + Math.pow(s, 1.45) * 18.5 * boostAmp) * koi.scale;
    const wavePhase = swimPhase - s * 5.4;
    const lateralOffset = Math.sin(wavePhase) * waveAmp;

    const nx = -Math.sin(basePt.angle);
    const ny = Math.cos(basePt.angle);

    spine[i].x = basePt.x + nx * lateralOffset;
    spine[i].y = basePt.y + ny * lateralOffset;
  }

  // Derive true geometric tangents & unit normals directly from the physical spine curve
  for (let i = 0; i < NUM_SPINE; i++) {
    let fwdX, fwdY;
    if (i === 0) {
      fwdX = spine[0].x - spine[1].x;
      fwdY = spine[0].y - spine[1].y;
    } else if (i === NUM_SPINE - 1) {
      fwdX = spine[i - 1].x - spine[i].x;
      fwdY = spine[i - 1].y - spine[i].y;
    } else {
      fwdX = spine[i - 1].x - spine[i + 1].x;
      fwdY = spine[i - 1].y - spine[i + 1].y;
    }
    const len = Math.sqrt(fwdX * fwdX + fwdY * fwdY) || 1;
    spine[i].angle = Math.atan2(fwdY, fwdX);
    spine[i].nx = -fwdY / len;
    spine[i].ny = fwdX / len;
  }
}

function drawSeamlessKoi(ctx, koi, time, isLightMode) {
  const { spine, scale, variant, phase, spots } = koi;
  const isInkBody = variant === "ink";
  const spotFill = isInkBody ? "#E3DAC9" : "#080808";
  const strokeColor = isInkBody
    ? "rgba(227, 218, 201, 0.5)"
    : "rgba(8, 8, 8, 0.78)";

  const normals = spine.map((pt) => ({
    nx: pt.nx,
    ny: pt.ny
  }));

  // Sculpted body contour with rounded U-shaped snout & plump torso
  const bodyPts = [];
  const nose = spine[0];
  const r0 = getKoiRadius(0) * 27 * scale;
  const snoutAngles = [-1.05, -0.52, 0, 0.52, 1.05];
  const snoutRadii = [r0 * 0.92, r0 * 0.96, r0 * 1.02, r0 * 0.96, r0 * 0.92];
  for (let k = 0; k < 5; k++) {
    const a = nose.angle + snoutAngles[k];
    const sr = snoutRadii[k] * 0.78;
    bodyPts.push({
      x: nose.x + Math.cos(a) * sr,
      y: nose.y + Math.sin(a) * sr
    });
  }
  for (let i = 1; i < BODY_SEGS; i++) {
    const r = getKoiRadius(i) * 27 * scale;
    bodyPts.push({
      x: spine[i].x + normals[i].nx * r,
      y: spine[i].y + normals[i].ny * r
    });
  }
  for (let i = BODY_SEGS - 1; i >= 1; i--) {
    const r = getKoiRadius(i) * 27 * scale;
    bodyPts.push({
      x: spine[i].x - normals[i].nx * r,
      y: spine[i].y - normals[i].ny * r
    });
  }

  const drawFin = (segIdx, side, finLen, finW, angleOff, isShadow = false) => {
    const pt = spine[segIdx];
    const norm = normals[segIdx];
    const r = getKoiRadius(segIdx) * 22 * scale;
    const ax = pt.x + norm.nx * r * side * 0.78;
    const ay = pt.y + norm.ny * r * side * 0.78;
    const flutter = Math.sin(time * 3.8 + phase + side) * 0.09 * side;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(pt.angle + side * angleOff + flutter);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      finLen * 0.24,
      side * finW * 0.9,
      -finLen * 0.42,
      side * finW * 1.08,
      -finLen * 0.96,
      side * finW * 0.62
    );
    ctx.bezierCurveTo(
      -finLen * 1.05,
      side * finW * 0.2,
      -finLen * 0.55,
      -side * finW * 0.08,
      0,
      0
    );
    ctx.closePath();

    if (isShadow) {
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.fillStyle = "rgba(227, 218, 201, 0.72)";
    ctx.fill();
    ctx.strokeStyle = "rgba(8, 8, 8, 0.28)";
    ctx.lineWidth = 0.85 * scale;
    ctx.stroke();
    ctx.restore();
  };

  const drawTail = (isShadow = false) => {
    const startIdx = 14;
    const rPed = getKoiRadius(startIdx) * 20 * scale;
    const endIdx = NUM_SPINE - 1;
    const endPt = spine[endIdx];
    const endNorm = normals[endIdx];
    const backX = -Math.cos(endPt.angle);
    const backY = -Math.sin(endPt.angle);

    ctx.save();
    ctx.beginPath();

    // 1) Start at left peduncle attachment
    ctx.moveTo(
      spine[startIdx].x - normals[startIdx].nx * rPed,
      spine[startIdx].y - normals[startIdx].ny * rPed
    );

    // 2) Left lobe outer boundary (expanding gracefully backwards)
    for (let i = startIdx + 1; i <= endIdx; i++) {
      const t = (i - startIdx) / (endIdx - startIdx);
      const spread = (rPed * (1 - t * 0.5) + Math.pow(t, 0.8) * 30 * scale);
      ctx.lineTo(
        spine[i].x - normals[i].nx * spread,
        spine[i].y - normals[i].ny * spread
      );
    }

    // 3) Left lobe tip curving around
    const tipSpread = 28 * scale;
    ctx.quadraticCurveTo(
      endPt.x - endNorm.nx * tipSpread + backX * (16 * scale),
      endPt.y - endNorm.ny * tipSpread + backY * (16 * scale),
      endPt.x - endNorm.nx * (tipSpread * 0.45) + backX * (22 * scale),
      endPt.y - endNorm.ny * (tipSpread * 0.45) + backY * (22 * scale)
    );

    // 4) Caudal cleft (notch in the center of the tail)
    ctx.quadraticCurveTo(
      endPt.x + backX * (10 * scale),
      endPt.y + backY * (10 * scale),
      endPt.x + endNorm.nx * (tipSpread * 0.45) + backX * (22 * scale),
      endPt.y + endNorm.ny * (tipSpread * 0.45) + backY * (22 * scale)
    );

    // 5) Right lobe tip curving around
    ctx.quadraticCurveTo(
      endPt.x + endNorm.nx * tipSpread + backX * (16 * scale),
      endPt.y + endNorm.ny * tipSpread + backY * (16 * scale),
      endPt.x + endNorm.nx * tipSpread,
      endPt.y + endNorm.ny * tipSpread
    );

    // 6) Right lobe outer boundary back to peduncle
    for (let i = endIdx - 1; i >= startIdx; i--) {
      const t = (i - startIdx) / (endIdx - startIdx);
      const spread = (rPed * (1 - t * 0.5) + Math.pow(t, 0.8) * 30 * scale);
      ctx.lineTo(
        spine[i].x + normals[i].nx * spread,
        spine[i].y + normals[i].ny * spread
      );
    }

    ctx.closePath();

    if (isShadow) {
      ctx.fill();
      ctx.restore();
      return;
    }

    // Tail fill & soft border
    ctx.fillStyle = isInkBody
      ? "rgba(227, 218, 201, 0.78)"
      : "rgba(240, 235, 222, 0.82)";
    ctx.fill();
    ctx.strokeStyle = isInkBody
      ? "rgba(227, 218, 201, 0.45)"
      : "rgba(8, 8, 8, 0.32)";
    ctx.lineWidth = 0.9 * scale;
    ctx.stroke();

    // 5 elegant translucent fin rays radiating into the caudal fin
    const numRays = 5;
    ctx.beginPath();
    for (let r = 0; r < numRays; r++) {
      const frac = (r / (numRays - 1)) * 2 - 1; // -1 to 1
      const startPt = spine[startIdx];
      const lobeDist = Math.abs(frac);
      const targetBack = (14 + (1 - lobeDist) * 5) * scale;
      const targetX =
        endPt.x + endNorm.nx * (frac * tipSpread * 0.85) + backX * targetBack;
      const targetY =
        endPt.y + endNorm.ny * (frac * tipSpread * 0.85) + backY * targetBack;

      const midPt = spine[18];
      const midX = midPt.x + normals[18].nx * (frac * 14 * scale);
      const midY = midPt.y + normals[18].ny * (frac * 14 * scale);

      ctx.moveTo(startPt.x, startPt.y);
      ctx.quadraticCurveTo(midX, midY, targetX, targetY);
    }
    ctx.strokeStyle = isInkBody
      ? "rgba(227, 218, 201, 0.3)"
      : "rgba(8, 8, 8, 0.22)";
    ctx.lineWidth = 0.75 * scale;
    ctx.stroke();

    ctx.restore();
  };

  // 1) 3D SHADOW UNDERNEATH THE FISH
  ctx.save();
  ctx.translate(16 * scale, 24 * scale);
  ctx.fillStyle = isLightMode
    ? "rgba(8, 8, 8, 0.13)"
    : "rgba(0, 0, 0, 0.48)";
  drawFin(3, 1, 54 * scale, 35 * scale, 0.5, true);
  drawFin(3, -1, 54 * scale, 35 * scale, 0.5, true);
  drawTail(true);
  traceSmoothClosedPolygon(ctx, bodyPts);
  ctx.fill();
  ctx.restore();

  // 2) CURVED WATER WAKE ARCS AROUND SHOULDERS
  ctx.save();
  ctx.strokeStyle = isLightMode
    ? "rgba(8, 8, 8, 0.13)"
    : "rgba(227, 218, 201, 0.15)";
  ctx.lineWidth = 1.15 * scale;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    const sh = spine[4];
    const n = normals[4];
    const dist = (40 + Math.sin(time * 3 + phase) * 5) * scale;
    ctx.beginPath();
    ctx.arc(
      sh.x + n.nx * dist * side,
      sh.y + n.ny * dist * side,
      19 * scale,
      sh.angle + Math.PI * 0.65,
      sh.angle + Math.PI * 1.25
    );
    ctx.stroke();
  }
  ctx.restore();

  // 3) PECTORAL, PELVIC & CAUDAL FINS
  drawFin(3, 1, 54 * scale, 35 * scale, 0.5, false);
  drawFin(3, -1, 54 * scale, 35 * scale, 0.5, false);
  drawFin(9, 1, 31 * scale, 19 * scale, 0.44, false);
  drawFin(9, -1, 31 * scale, 19 * scale, 0.44, false);
  drawTail(false);

  // 4) SCULPTED VOLUMETRIC KOI BODY + ROUNDED MOUTH + SUMI SPOTS
  ctx.save();
  traceSmoothClosedPolygon(ctx, bodyPts);
  ctx.fillStyle = isInkBody ? "#141312" : "#E3DAC9";
  ctx.fill();
  ctx.clip();

  // Organic Koi Patches (Sumi spots)
  ctx.fillStyle = spotFill;
  spots.forEach((sp) => {
    const segIdx = Math.min(BODY_SEGS - 2, sp.seg);
    const pt = spine[segIdx];
    const norm = normals[segIdx];
    const segR = getKoiRadius(segIdx) * 26 * scale;

    ctx.save();
    ctx.translate(
      pt.x + norm.nx * segR * sp.side,
      pt.y + norm.ny * segR * sp.side
    );
    ctx.rotate(pt.angle + sp.rot);

    ctx.beginPath();
    ctx.ellipse(0, 0, sp.rx * scale, sp.ry * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(
      sp.rx * 0.45 * scale,
      sp.ry * 0.25 * scale,
      sp.rx * 0.65 * scale,
      sp.ry * 0.72 * scale,
      0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  });

  // 3D Torso Volume Shading along left & right flanks (gives real cylindrical fish body depth)
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let i = 1; i < BODY_SEGS; i++) {
      const r = getKoiRadius(i) * 27 * scale;
      const px = spine[i].x + normals[i].nx * r * side;
      const py = spine[i].y + normals[i].ny * r * side;
      if (i === 1) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = isInkBody
      ? "rgba(0, 0, 0, 0.68)"
      : "rgba(8, 8, 8, 0.26)";
    ctx.lineWidth = 9.0 * scale;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Broad 3D Dorsal Crown Highlight (spinal light reflection)
  ctx.beginPath();
  for (let i = 1; i < BODY_SEGS - 2; i++) {
    if (i === 1) ctx.moveTo(spine[i].x, spine[i].y);
    else ctx.lineTo(spine[i].x, spine[i].y);
  }
  ctx.strokeStyle = isInkBody
    ? "rgba(227, 218, 201, 0.22)"
    : "rgba(255, 253, 248, 0.55)";
  ctx.lineWidth = 14 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  // Subtle gill arches (opérculos) giving structure to the head & body
  const gillPt = spine[2];
  const gillNorm = normals[2];
  const gillR = getKoiRadius(2) * 26 * scale;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    const gx = gillPt.x + gillNorm.nx * gillR * side * 0.9;
    const gy = gillPt.y + gillNorm.ny * gillR * side * 0.9;
    ctx.arc(
      gx - Math.cos(gillPt.angle) * 3 * scale,
      gy - Math.sin(gillPt.angle) * 3 * scale,
      7.5 * scale,
      gillPt.angle + (side === 1 ? -1.8 : 0.4),
      gillPt.angle + (side === 1 ? -0.4 : 1.8)
    );
    ctx.strokeStyle = isInkBody
      ? "rgba(227, 218, 201, 0.28)"
      : "rgba(8, 8, 8, 0.22)";
    ctx.lineWidth = 1.3 * scale;
    ctx.stroke();
  }

  ctx.restore(); // End body clip

  // Outer body contour stroke
  traceSmoothClosedPolygon(ctx, bodyPts);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.25 * scale;
  ctx.stroke();

  // Anatomical Rounded Carp Snout & Soft Mouth Indentation
  const snoutTipDist = r0 * 0.82;
  const mouthTipX = nose.x + Math.cos(nose.angle) * snoutTipDist;
  const mouthTipY = nose.y + Math.sin(nose.angle) * snoutTipDist;
  const n0 = normals[0];
  const mouthW = r0 * 0.52;

  // Fleshy lip highlight
  ctx.beginPath();
  ctx.moveTo(mouthTipX - n0.nx * mouthW, mouthTipY - n0.ny * mouthW);
  ctx.quadraticCurveTo(
    mouthTipX + Math.cos(nose.angle) * 2.8 * scale,
    mouthTipY + Math.sin(nose.angle) * 2.8 * scale,
    mouthTipX + n0.nx * mouthW,
    mouthTipY + n0.ny * mouthW
  );
  ctx.strokeStyle = isInkBody ? "#E3DAC9" : "#C9BFA8";
  ctx.lineWidth = 2.4 * scale;
  ctx.lineCap = "round";
  ctx.stroke();

  // Subtle dark mouth seam slit
  ctx.beginPath();
  ctx.moveTo(
    mouthTipX - n0.nx * (mouthW * 0.85) - Math.cos(nose.angle) * 0.8 * scale,
    mouthTipY - n0.ny * (mouthW * 0.85) - Math.sin(nose.angle) * 0.8 * scale
  );
  ctx.quadraticCurveTo(
    mouthTipX - Math.cos(nose.angle) * 1.8 * scale,
    mouthTipY - Math.sin(nose.angle) * 1.8 * scale,
    mouthTipX + n0.nx * (mouthW * 0.85) - Math.cos(nose.angle) * 0.8 * scale,
    mouthTipY + n0.ny * (mouthW * 0.85) - Math.sin(nose.angle) * 0.8 * scale
  );
  ctx.strokeStyle = isInkBody ? "rgba(0, 0, 0, 0.8)" : "rgba(8, 8, 8, 0.65)";
  ctx.lineWidth = 1.3 * scale;
  ctx.stroke();

  // 5) FLOWING DORSAL FIN ALONG THE BACK (Segments 4..12)
  ctx.beginPath();
  for (let i = 4; i <= 12; i++) {
    const t = (i - 4) / 8;
    const crest =
      Math.sin(t * Math.PI) * 9 * scale +
      Math.sin(time * 4.0 + phase - i * 0.4) * 3.5 * scale;
    const px = spine[i].x - normals[i].nx * crest;
    const py = spine[i].y - normals[i].ny * crest;
    if (i === 4) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 12; i >= 4; i--) {
    ctx.lineTo(spine[i].x, spine[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(227, 218, 201, 0.82)";
  ctx.fill();
  ctx.strokeStyle = "#080808";
  ctx.lineWidth = 1.15 * scale;
  ctx.stroke();

  // 6) EYES & FLOWING KOI BARBELS (Whiskers emerging naturally from mouth corners)
  const eyeSeg = spine[1];
  const eyeNorm = normals[1];
  const eyeDist = getKoiRadius(1) * 22 * scale;

  for (const side of [-1, 1]) {
    const ex = eyeSeg.x + eyeNorm.nx * eyeDist * side;
    const ey = eyeSeg.y + eyeNorm.ny * eyeDist * side;

    ctx.beginPath();
    ctx.arc(ex, ey, 3.0 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#E3DAC9";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex, ey, 1.7 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#080808";
    ctx.fill();

    // Barbels anchored precisely at the corner of the mouth
    const bx = mouthTipX + n0.nx * mouthW * side;
    const by = mouthTipY + n0.ny * mouthW * side;
    const wAng = nose.angle + side * 0.58 + Math.sin(time * 3.5 + side) * 0.08;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(wAng) * 11 * scale,
      by + Math.sin(wAng) * 11 * scale,
      bx + Math.cos(wAng + side * 0.35) * 17 * scale,
      by + Math.sin(wAng + side * 0.35) * 17 * scale
    );
    ctx.strokeStyle = isInkBody ? "#E3DAC9" : "rgba(8, 8, 8, 0.85)";
    ctx.lineWidth = 1.25 * scale;
    ctx.stroke();
  }
}

// Fast top-down ocean swells (low vertex count for silky 120fps)
function drawTopDownOceanSwells(ctx, width, height, time, isLightMode) {
  const rgb = isLightMode ? "8, 8, 8" : "227, 218, 201";
  const numSwells = 6;
  const swellSpacing = (width + height) / numSwells;

  for (let s = -1; s <= numSwells + 1; s++) {
    const travel = (time * 22) % swellSpacing;
    const baseOffset = s * swellSpacing + travel;

    ctx.beginPath();
    const steps = 14;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const x = t * width;
      const y =
        baseOffset -
        x * 0.28 +
        Math.sin(t * Math.PI * 3 + time * 0.75 + s) * 26 +
        Math.cos(t * Math.PI * 5 - time * 0.55 + s * 1.7) * 12;

      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(${rgb}, 0.055)`;
    ctx.lineWidth = 18;
    ctx.stroke();

    ctx.strokeStyle = `rgba(${rgb}, 0.08)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  const numCrossWaves = 7;
  const rowStep = height / numCrossWaves;
  ctx.strokeStyle = `rgba(${rgb}, 0.04)`;
  ctx.lineWidth = 1.0;
  for (let r = 0; r <= numCrossWaves; r++) {
    const baseY = r * rowStep;
    ctx.beginPath();
    for (let x = 0; x <= width + 80; x += 80) {
      const py =
        baseY +
        Math.sin(x * 0.0045 + time * 0.85 + r * 0.9) * 20 +
        Math.cos(x * 0.009 - time * 0.6 + r * 1.4) * 10;
      if (x === 0) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }
}

export default function KoiLagoon({ isLightMode, children }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const koisRef = useRef([]);
  const scareBurstsRef = useRef([]);

  useEffect(() => {
    const containerEl = containerRef.current;
    const canvasEl = canvasRef.current;
    if (!containerEl || !canvasEl) return;

    const ctx = canvasEl.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let width = containerEl.clientWidth || window.innerWidth;
    let height = containerEl.clientHeight || window.innerHeight * 2;
    // Cap DPR at 1.25 for ultra-fast 60/120fps canvas fill rate
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    const resizeCanvas = () => {
      width = containerEl.clientWidth || window.innerWidth;
      height = containerEl.clientHeight || window.innerHeight * 2;
      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // EXACTLY 6 KOI FISH: 2 VERY LARGE ("BIEN Grandes") + 2 MEDIUM ("medianos") + 2 SMALL ("pequeños")
    const kois = [
      // 1. BIEN GRANDE #1 (Bone Shiro Utsuri — scale 1.82)
      createKoi({
        x: width * 0.22,
        y: height * 0.22,
        angle: 0.35,
        scale: 1.82,
        speed: 1.85,
        variant: "bone",
        phase: 0.0,
        spots: [
          { seg: 2, side: 0.1, rx: 16, ry: 11, rot: 0.1 },
          { seg: 4, side: -0.25, rx: 24, ry: 15, rot: -0.2 },
          { seg: 7, side: 0.22, rx: 22, ry: 14, rot: 0.15 },
          { seg: 10, side: -0.18, rx: 20, ry: 12, rot: -0.1 },
          { seg: 12, side: 0.12, rx: 14, ry: 9, rot: 0 }
        ]
      }),
      // 2. BIEN GRANDE #2 (Ink-Black Matsuba — scale 1.72)
      createKoi({
        x: width * 0.76,
        y: height * 0.58,
        angle: 2.65,
        scale: 1.72,
        speed: 1.78,
        variant: "ink",
        phase: 1.8,
        spots: [
          { seg: 2, side: -0.15, rx: 17, ry: 11, rot: -0.15 },
          { seg: 5, side: 0.28, rx: 23, ry: 14, rot: 0.2 },
          { seg: 8, side: -0.2, rx: 18, ry: 12, rot: -0.1 },
          { seg: 11, side: 0.08, rx: 13, ry: 8, rot: 0 }
        ]
      }),
      // 3. MEDIANO #1 (Bone Calico — scale 1.05)
      createKoi({
        x: width * 0.52,
        y: height * 0.38,
        angle: -0.65,
        scale: 1.05,
        speed: 2.12,
        variant: "bone",
        phase: 3.4,
        spots: [
          { seg: 1, side: -0.05, rx: 13, ry: 9, rot: 0 },
          { seg: 4, side: 0.26, rx: 22, ry: 14, rot: 0.25 },
          { seg: 7, side: -0.28, rx: 18, ry: 12, rot: -0.2 },
          { seg: 10, side: 0.15, rx: 15, ry: 10, rot: 0.1 }
        ]
      }),
      // 4. MEDIANO #2 (Ink-Black — scale 0.95)
      createKoi({
        x: width * 0.34,
        y: height * 0.74,
        angle: 0.85,
        scale: 0.95,
        speed: 2.05,
        variant: "ink",
        phase: 4.9,
        spots: [
          { seg: 2, side: 0.18, rx: 17, ry: 11, rot: 0.15 },
          { seg: 6, side: -0.22, rx: 20, ry: 13, rot: -0.2 },
          { seg: 10, side: 0.2, rx: 15, ry: 10, rot: 0.1 }
        ]
      }),
      // 5. PEQUEÑO #1 (Bone — scale 0.54)
      createKoi({
        x: width * 0.68,
        y: height * 0.28,
        angle: -2.1,
        scale: 0.54,
        speed: 2.25,
        variant: "bone",
        phase: 6.2,
        spots: [
          { seg: 2, side: 0.12, rx: 15, ry: 10, rot: 0.1 },
          { seg: 6, side: -0.25, rx: 19, ry: 12, rot: -0.2 },
          { seg: 10, side: 0.18, rx: 16, ry: 10, rot: 0.15 }
        ]
      }),
      // 6. PEQUEÑO #2 (Bone — scale 0.46)
      createKoi({
        x: width * 0.18,
        y: height * 0.54,
        angle: 0.15,
        scale: 0.46,
        speed: 2.2,
        variant: "bone",
        phase: 7.7,
        spots: [
          { seg: 3, side: -0.2, rx: 17, ry: 11, rot: -0.15 },
          { seg: 7, side: 0.22, rx: 18, ry: 12, rot: 0.2 },
          { seg: 11, side: -0.1, rx: 13, ry: 8, rot: 0 }
        ]
      })
    ];
    koisRef.current = kois;

    let isVisible = false;
    let lastTime = gsap.ticker.time;

    const tick = () => {
      if (!isVisible) return;

      const time = gsap.ticker.time;
      const dt = Math.min(0.05, Math.max(0.008, time - lastTime));
      lastTime = time;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1) Draw Top-Down Ocean Swells
      drawTopDownOceanSwells(ctx, width, height, time, isLightMode);

      // 2) Draw Click-Scare Splash Rings
      const bursts = scareBurstsRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.r += 4.2;
        b.alpha *= 0.92;
        if (b.alpha < 0.015) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = isLightMode
          ? `rgba(8, 8, 8, ${b.alpha.toFixed(3)})`
          : `rgba(227, 218, 201, ${b.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 3) Update & Render the 6 Koi Fish
      const marginX = 140;
      const marginY = 140;

      kois.forEach((koi) => {
        if (koi.scareBoost > 0.01) {
          koi.scareBoost *= 0.965;
          let diff = koi.scareAngle - koi.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;

          const maxEscapeTurn = 0.045;
          koi.curvature = Math.max(
            -maxEscapeTurn,
            Math.min(maxEscapeTurn, diff * 0.14)
          );
          koi.angle += koi.curvature;
        } else {
          koi.scareBoost = 0;
          koi.wanderTimer++;
          if (koi.wanderTimer > 95) {
            koi.wanderTimer = 0;
            koi.targetCurvature =
              (Math.sin(time * 0.9 + koi.phase * 2.3) * 0.8 +
                Math.cos(time * 0.5 + koi.phase) * 0.4) *
              0.0065;
          }

          const lookAheadX = koi.x + Math.cos(koi.angle) * 220;
          const lookAheadY = koi.y + Math.sin(koi.angle) * 220;

          if (
            lookAheadX < marginX ||
            lookAheadX > width - marginX ||
            lookAheadY < marginY ||
            lookAheadY > height - marginY
          ) {
            const centerAngle = Math.atan2(
              height * 0.5 - koi.y,
              width * 0.5 - koi.x
            );
            let diff = centerAngle - koi.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            koi.targetCurvature = Math.max(
              -0.012,
              Math.min(0.012, diff * 0.018)
            );
          }

          koi.curvature += (koi.targetCurvature - koi.curvature) * 0.04;
          koi.angle += koi.curvature;
        }

        const speedMultiplier = 1 + koi.scareBoost * 2.4;
        const currentSpeed = koi.speed * speedMultiplier;
        koi.swimPhase += dt * (4.4 + koi.scareBoost * 9.5);

        koi.x += Math.cos(koi.angle) * currentSpeed;
        koi.y += Math.sin(koi.angle) * currentSpeed;

        if (koi.x < -90) koi.x = -90;
        if (koi.x > width + 90) koi.x = width + 90;
        if (koi.y < -90) koi.y = -90;
        if (koi.y > height + 90) koi.y = height + 90;

        koi.trail.unshift({
          x: koi.x,
          y: koi.y,
          angle: koi.angle
        });
        if (koi.trail.length > TRAIL_LENGTH) {
          koi.trail.pop();
        }

        updateKoiSpineFromTrail(koi);
        drawSeamlessKoi(ctx, koi, time, isLightMode);
      });

      ctx.restore();
    };

    // Only add ticker listener when KoiLagoon is in or near the viewport
    let isTicking = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = gsap.ticker.time;
          if (!isTicking) {
            isTicking = true;
            gsap.ticker.add(tick);
          }
        } else {
          if (isTicking) {
            isTicking = false;
            gsap.ticker.remove(tick);
          }
        }
      },
      { rootMargin: "180px" }
    );
    observer.observe(containerEl);

    return () => {
      observer.disconnect();
      if (isTicking) gsap.ticker.remove(tick);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isLightMode]);

  const handleMouseDown = (e) => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    scareBurstsRef.current.push({
      x: clickX,
      y: clickY,
      r: 6,
      alpha: 0.45
    });

    const scareRadius = 640;
    koisRef.current.forEach((koi) => {
      const dx = koi.x - clickX;
      const dy = koi.y - clickY;
      const dist = Math.hypot(dx, dy);
      if (dist < scareRadius) {
        const strength = Math.max(0.45, 1 - dist / scareRadius);
        koi.scareBoost = Math.min(1.25, koi.scareBoost + strength * 1.15);
        koi.scareAngle = Math.atan2(dy, dx);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="relative w-full overflow-hidden"
    >
      {/* Lagoon Canvas Background (Top-Down Ocean Swells + 6 Koi: 2 Very Large, 2 Medium, 2 Small) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
      />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
