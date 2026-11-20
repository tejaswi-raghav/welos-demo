"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";

export type SunParams = {
  /** 0–1 intro progress: horizon line → sunrise */
  reveal: number;
  /** 0–1 scroll progress through the host section */
  scroll: number;
  /** 0–1 horizontal light sweep (campaign mode) */
  sweep: number;
  /** horizontal sun offset in screen-height units (hero mode) */
  x: number;
};

type Props = {
  mode?: "hero" | "campaign";
  params: MutableRefObject<SunParams>;
  className?: string;
};

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uReveal, uScroll, uSweep, uMode, uX;
uniform vec2 uMouse;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = p*2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  float reveal = clamp(uReveal, 0.0, 1.0);

  // ── scene layout ─────────────────────────────────────
  float hy;        // horizon height
  vec2  c;         // sun centre
  float R;         // sun radius
  if (uMode < 0.5) {
    hy = -0.16 + uScroll * 0.10;                    // camera dips toward the horizon
    R  = (aspect < 1.0 ? 0.24 : 0.30) * (1.0 + uScroll * 0.9);
    float rise = smoothstep(0.12, 1.0, reveal);
    float cy = mix(hy - R * 1.05, 0.13 - uScroll * 0.05, rise);
    c = vec2(uX + uMouse.x * 0.02, cy + uMouse.y * 0.01);
  } else {
    hy = -0.30;
    R  = 0.95;
    c  = vec2(mix(0.55, -0.35, uSweep) * aspect, -0.62);
  }

  vec2 d2 = uv - c;
  float d = length(d2);
  float above = smoothstep(hy - 0.0015, hy + 0.0015, uv.y);

  vec3 col = vec3(0.0);

  // ── photosphere: limb darkening + granulation ─────────
  float inDisc = smoothstep(R, R - 0.0025, d);
  float mu = sqrt(max(0.0, 1.0 - (d*d)/(R*R)));
  float limb = pow(mu, 0.55);
  vec2 sp = d2 / R;
  float gran = fbm(sp * 9.0 + vec2(t*0.015, -t*0.01));
  float cells = fbm(sp * 28.0 - t*0.02);
  vec3 photo = mix(vec3(1.0, 0.36, 0.02), vec3(1.0, 0.86, 0.45), limb);
  photo *= 1.5 + 1.6*limb + 0.3*(gran - 0.5) + 0.14*(cells - 0.5);
  col += photo * inDisc;

  // ── corona / bloom with slow ray structure ────────────
  float dd = max(d - R, 0.0);
  float ang = atan(d2.y, d2.x) + uMouse.x * 0.08;
  float rays = fbm(vec2(ang * 4.0, dd * 3.0 - t * 0.04));
  float glow = 1.0*exp(-dd*18.0) + 0.32*exp(-dd*5.5) + 0.06*exp(-dd*1.6);
  glow *= 0.75 + 0.5*rays;
  vec3 coronaCol = mix(vec3(1.0, 0.42, 0.04), vec3(1.0, 0.78, 0.25), exp(-dd*10.0));
  col += coronaCol * glow * (1.0 - inDisc);

  // ── plasma filaments: ridged noise arcs hugging the limb ──
  float rr = d / R;
  float band = smoothstep(0.96, 1.0, rr) * (1.0 - smoothstep(1.0, 1.22, rr));
  float fil = 0.0;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float n = fbm(vec2(ang * (3.0 + fi * 2.0) + fi * 4.1, rr * (6.0 + fi * 3.0) - t * (0.06 + fi * 0.03)));
    float ridge = 1.0 - abs(n * 2.0 - 1.0);
    fil += pow(ridge, 14.0 + fi * 6.0);
  }
  col += vec3(1.0, 0.62, 0.15) * fil * band * 1.1;

  float sunAmt = smoothstep(0.05, 0.55, reveal);
  col *= sunAmt;

  // ── atmosphere: warm haze band above the horizon ───────
  float h = uv.y - hy;
  float hazeBand = exp(-max(h, 0.0) * 5.5) * above;
  float hazeX = exp(-abs(uv.x - c.x) * (uMode < 0.5 ? 0.9 : 0.5));
  vec3 haze = vec3(0.55, 0.20, 0.03) * hazeBand * hazeX * (0.35 + 0.65*reveal);
  float drift = fbm(vec2(uv.x*2.2 + t*0.02, uv.y*7.0));
  haze *= 0.75 + 0.5*drift;
  col += haze;

  // ── occlusion: ground below horizon ───────────────────
  vec3 ground = vec3(0.012, 0.010, 0.009);
  float refl = exp(-max(-h, 0.0) * 22.0) * hazeX;
  ground += vec3(0.9, 0.38, 0.06) * refl * 0.35 * sunAmt;
  ground += vec3(0.04, 0.025, 0.015) * fbm(vec2(uv.x*40.0, uv.y*120.0)) * refl;
  col = mix(ground, col, above);

  // ── horizon line: the first light ─────────────────────
  float lineW = mix(900.0, 420.0, reveal);
  float line = exp(-abs(h) * lineW) * exp(-abs(uv.x - c.x) * mix(3.0, 0.6, reveal));
  col += vec3(1.0, 0.78, 0.3) * line * (1.4 * smoothstep(0.0, 0.12, reveal));

  // ── particles: dust lit by the sun ────────────────────
  {
    float lit = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float s = 16.0 + fi * 13.0;
      vec2 pp = uv * s + vec2(t * (0.05 + fi*0.03), t * (0.12 + fi*0.05));
      vec2 cell = floor(pp);
      vec2 f = fract(pp) - 0.5;
      float r = hash(cell + fi*7.13);
      vec2 o = vec2(hash(cell*1.7 + 3.1), hash(cell*2.3 + 1.7)) - 0.5;
      float size = 0.035 + 0.05*r;
      float p = smoothstep(size, 0.0, length(f - o*0.7)) * step(0.72, r);
      lit += p * (0.5 + 0.5*sin(t*1.5 + r*40.0));
    }
    float light = exp(-dd*2.2) * above;
    col += vec3(1.0, 0.72, 0.35) * lit * light * 0.9 * reveal;
  }

  // ── grade ─────────────────────────────────────────────
  col = 1.0 - exp(-col * 1.1);
  col = pow(col, vec3(0.95, 1.0, 1.08));
  float vig = smoothstep(1.25, 0.25, length(uv * vec2(0.85, 1.0)));
  col *= mix(0.55, 1.0, vig);
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * 0.018;
  col = max(col, vec3(0.0));
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log ?? "shader compile failed");
  }
  return s;
}

export function SunCanvas({ mode = "hero", params, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false });
    if (!gl || gl.isContextLost()) { setFailed(true); return; }

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link failed");
    } catch (e) {
      console.warn("[SunCanvas] falling back:", e);
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes"), uTime = u("uTime"), uReveal = u("uReveal"), uScroll = u("uScroll"), uSweep = u("uSweep"), uMode = u("uMode"), uMouse = u("uMouse"), uX = u("uX");
    gl.uniform1f(uMode, mode === "hero" ? 0 : 1);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Adaptive resolution: start conservative on touch devices, adjust by frame time.
    let quality = coarse ? 0.6 : 0.85;
    const maxDpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      const scale = maxDpr * quality;
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer + device-orientation parallax (eased, understated)
    const target = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      target.x = Math.max(-1, Math.min(1, e.gamma / 30));
      target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("deviceorientation", onOrient, { passive: true });
    }

    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick(); }, { rootMargin: "100px" });
    io.observe(canvas);

    let raf = 0;
    let running = false;
    const start = performance.now();
    let last = start;
    let slow = 0, fast = 0;

    const draw = (now: number) => {
      const t = reduced ? 12.0 : (now - start) / 1000;
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      const p = params.current;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uReveal, p.reveal);
      gl.uniform1f(uScroll, p.scroll);
      gl.uniform1f(uSweep, p.sweep);
      gl.uniform1f(uX, p.x);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (!visible || document.hidden) { running = false; return; }
      const dt = now - last;
      last = now;
      // adapt resolution to hold ~50+ fps
      if (dt > 26) { slow++; fast = 0; } else if (dt < 14) { fast++; slow = 0; }
      if (slow > 20 && quality > 0.45) { quality -= 0.1; slow = 0; resize(); }
      if (fast > 120 && quality < 1) { quality = Math.min(1, quality + 0.05); fast = 0; resize(); }
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    // Reduced motion: still respond to scroll/reveal changes, but no time-based animation.
    kick();
    const onVis = () => !document.hidden && kick();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
      document.removeEventListener("visibilitychange", onVis);
      // Free GPU objects but keep the context: StrictMode/HMR remounts reuse the same canvas.
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [mode, params]);

  if (failed) {
    return (
      <div
        aria-hidden
        className={className}
        style={{
          background:
            mode === "hero"
              ? "radial-gradient(circle at 50% 38%, #fff6c8 0, #ffe135 9%, #ff8a00 17%, rgba(184,92,0,.45) 30%, rgba(11,11,11,0) 55%), linear-gradient(#0b0b0b 0 66%, #140b04 66.2%, #050505 100%)"
              : "radial-gradient(circle at 70% 100%, #fff6c8 0, #ffe135 18%, #ff8a00 34%, rgba(184,92,0,.4) 50%, #0b0b0b 75%)",
        }}
      />
    );
  }
  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
