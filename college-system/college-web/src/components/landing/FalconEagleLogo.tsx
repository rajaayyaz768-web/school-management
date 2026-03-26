"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface FalconEagleLogoProps {
  /** Width/height of the canvas in px */
  size?: number;
  /** Whether to show the "Falcon School System" text */
  showName?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

/**
 * Animated flying eagle logo with wing-flap animation.
 * Renders on a transparent canvas — no background.
 * Fixed at 2.5× animation speed.
 */
export function FalconEagleLogo({
  size = 48,
  showName = false,
  className = "",
}: FalconEagleLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);

  // Store pre-rendered frames
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const tRef = useRef(0);

  const FRAME_COUNT = 8;
  const SPEED_MULT = 2.5;
  const CANVAS_INTERNAL = 460; // internal resolution matches original

  // Background removal (ported from the HTML file)
  const removeBackground = useCallback((imgEl: HTMLImageElement): HTMLCanvasElement => {
    const ow = imgEl.naturalWidth;
    const oh = imgEl.naturalHeight;
    const oc = document.createElement("canvas");
    oc.width = ow;
    oc.height = oh;
    const octx = oc.getContext("2d")!;
    octx.drawImage(imgEl, 0, 0);

    const id = octx.getImageData(0, 0, ow, oh);
    const d = id.data;

    function isBg(di: number) {
      const r = d[di], g = d[di + 1], b = d[di + 2], a = d[di + 3];
      if (a < 10) return true;
      const light = (r + g + b) / 3;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      return light > 165 && sat < 30;
    }

    const visited = new Uint8Array(ow * oh);
    const queue: number[] = [];

    function seed(x: number, y: number) {
      const i = y * ow + x;
      if (!visited[i] && isBg(i * 4)) {
        visited[i] = 1;
        queue.push(i);
      }
    }

    for (let x = 0; x < ow; x++) { seed(x, 0); seed(x, oh - 1); }
    for (let y = 0; y < oh; y++) { seed(0, y); seed(ow - 1, y); }

    let head = 0;
    while (head < queue.length) {
      const i = queue[head++];
      const x = i % ow, y = Math.floor(i / ow);
      const neighbors = [i - 1, i + 1, i - ow, i + ow];
      const valid = [x > 0, x < ow - 1, y > 0, y < oh - 1];
      for (let n = 0; n < 4; n++) {
        if (!valid[n]) continue;
        const ni = neighbors[n];
        if (visited[ni]) continue;
        if (isBg(ni * 4)) { visited[ni] = 1; queue.push(ni); }
      }
    }

    // Kill isolated checkerboard remnants
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 1; y < oh - 1; y++) {
        for (let x = 1; x < ow - 1; x++) {
          const i = y * ow + x;
          if (visited[i]) continue;
          if (!isBg(i * 4)) continue;
          let tCount = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ni = (y + dy) * ow + (x + dx);
            if (visited[ni] || d[ni * 4 + 3] < 40) tCount++;
          }
          if (tCount >= 5) { d[i * 4 + 3] = 0; visited[i] = 1; }
        }
      }
    }

    for (let i = 0; i < ow * oh; i++) { if (visited[i]) d[i * 4 + 3] = 0; }

    // Soft edge feathering
    for (let y = 1; y < oh - 1; y++) {
      for (let x = 1; x < ow - 1; x++) {
        const i = y * ow + x;
        const di = i * 4;
        if (d[di + 3] === 0) continue;
        let hasTransparent = false;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (d[((y + dy) * ow + (x + dx)) * 4 + 3] === 0) { hasTransparent = true; break; }
        }
        if (hasTransparent) d[di + 3] = Math.min(d[di + 3], 200);
      }
    }

    octx.putImageData(id, 0, 0);
    return oc;
  }, []);

  // Build a single animation frame
  const buildFrame = useCallback((clean: HTMLCanvasElement, wingPhase: number, W: number, H: number): HTMLCanvasElement => {
    const PIVOT_Y = H * 0.56;
    const BLEND_ZONE = 45;
    const wingScale = 1 - wingPhase * 0.33;
    const bodyDrop = wingPhase * 7;

    const fc = document.createElement("canvas");
    fc.width = W; fc.height = H;
    const fctx = fc.getContext("2d")!;

    // Wing layer
    const wingLayer = document.createElement("canvas");
    wingLayer.width = W; wingLayer.height = H;
    const wl = wingLayer.getContext("2d")!;
    wl.save();
    wl.translate(0, PIVOT_Y);
    wl.scale(1, wingScale);
    wl.translate(0, -PIVOT_Y);
    wl.drawImage(clean, 0, (H - H) / 2, W, H);
    wl.restore();
    wl.globalCompositeOperation = "destination-in";
    const wGrad = wl.createLinearGradient(0, PIVOT_Y - BLEND_ZONE, 0, PIVOT_Y + BLEND_ZONE * 0.5);
    wGrad.addColorStop(0, "rgba(0,0,0,1)");
    wGrad.addColorStop(1, "rgba(0,0,0,0)");
    wl.fillStyle = wGrad;
    wl.fillRect(0, 0, W, H);

    // Body layer
    const bodyLayer = document.createElement("canvas");
    bodyLayer.width = W; bodyLayer.height = H;
    const bl = bodyLayer.getContext("2d")!;
    bl.save();
    bl.translate(0, bodyDrop * 0.4);
    bl.drawImage(clean, 0, 0, W, H);
    bl.restore();
    bl.globalCompositeOperation = "destination-in";
    const bGrad = bl.createLinearGradient(0, PIVOT_Y - BLEND_ZONE * 0.5, 0, PIVOT_Y + BLEND_ZONE);
    bGrad.addColorStop(0, "rgba(0,0,0,0)");
    bGrad.addColorStop(1, "rgba(0,0,0,1)");
    bl.fillStyle = bGrad;
    bl.fillRect(0, 0, W, H);

    fctx.drawImage(bodyLayer, 0, 0);
    fctx.drawImage(wingLayer, 0, 0);

    return fc;
  }, []);

  useEffect(() => {
    let mounted = true;
    const img = new Image();
    // Removed crossOrigin as it's same-origin and might cause issues
    
    img.onload = () => {
      if (!mounted) return;
      console.log("FalconEagleLogo: Image loaded, starting processing...");
      try {
        const clean = removeBackground(img);

        // Scale the cleaned image to internal canvas size
        const scaled = document.createElement("canvas");
        scaled.width = CANVAS_INTERNAL;
        scaled.height = CANVAS_INTERNAL;
        const sctx = scaled.getContext("2d")!;
        sctx.drawImage(clean, 0, 0, CANVAS_INTERNAL, CANVAS_INTERNAL);

        // Pre-render all frames
        const frames: HTMLCanvasElement[] = [];
        for (let f = 0; f < FRAME_COUNT; f++) {
          const angle = (f / FRAME_COUNT) * Math.PI * 2;
          const phase = (1 - Math.cos(angle)) / 2;
          frames.push(buildFrame(scaled, phase, CANVAS_INTERNAL, CANVAS_INTERNAL));
        }
        framesRef.current = frames;
        console.log("FalconEagleLogo: Frames processed successfully");
        setLoaded(true);
      } catch (err) {
        console.error("FalconEagleLogo: Error processing image frames:", err);
      }
    };
    
    img.onerror = (err) => {
      console.error("FalconEagleLogo: Failed to load /eagle-sprite.png", err);
    };
    
    img.src = "/eagle-sprite.png";
    
    return () => {
      mounted = false;
    };
  }, [removeBackground, buildFrame]);

  // Animation loop
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = CANVAS_INTERNAL;
    const H = CANVAS_INTERNAL;
    const frames = framesRef.current;

    function animate() {
      tRef.current += SPEED_MULT * 0.04;
      const t = tRef.current;

      const fi = Math.floor(t) % FRAME_COUNT;
      const next = (fi + 1) % FRAME_COUNT;
      const blend = t % 1;

      ctx!.clearRect(0, 0, W, H);

      ctx!.globalAlpha = 1;
      ctx!.drawImage(frames[fi], 0, 0);
      ctx!.globalAlpha = blend;
      ctx!.drawImage(frames[next], 0, 0);
      ctx!.globalAlpha = 1;

      // Pulsing gold glow synced to flap
      const gA = 0.08 + blend * 0.10;
      const grd = ctx!.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, 210);
      grd.addColorStop(0, `rgba(201,168,76,${gA})`);
      grd.addColorStop(1, "rgba(201,168,76,0)");
      ctx!.fillStyle = grd;
      ctx!.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [loaded]);

  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      style={{ lineHeight: 0 }}
    >
      <div
        style={{
          width: size,
          height: size,
          filter: "drop-shadow(0 0 12px rgba(201,168,76,0.35)) drop-shadow(0 0 24px rgba(201,168,76,0.15))",
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_INTERNAL}
          height={CANVAS_INTERNAL}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>
      {showName && (
        <span
          style={{
            color: "#c9a84c",
            fontSize: Math.max(8, size * 0.18),
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontFamily: "'Palatino Linotype', 'Georgia', serif",
            marginTop: size * 0.05,
            opacity: 0.85,
            whiteSpace: "nowrap",
            lineHeight: 1.2,
          }}
        >
          Falcon School System
        </span>
      )}
    </div>
  );
}
