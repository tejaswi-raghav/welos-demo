"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ComponentId, Source } from "@/lib/installation";

type Props = {
  selected: ComponentId | null;
  hovered: ComponentId | null;
  enabled: Record<Source, boolean>;
  onSelect: (id: ComponentId) => void;
  onHover: (id: ComponentId | null) => void;
  active: boolean;
};

const SOLAR = new THREE.Color("#FFE135");
const ORANGE = new THREE.Color("#FF8A00");

function useHighlight(id: ComponentId, p: Props) {
  const on = p.selected === id || p.hovered === id;
  return {
    emissive: on ? ORANGE : new THREE.Color("#000000"),
    emissiveIntensity: on ? (p.selected === id ? 0.22 : 0.12) : 0,
    handlers: {
      onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); p.onSelect(id); },
      onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); p.onHover(id); document.body.style.cursor = "pointer"; },
      onPointerOut: () => { p.onHover(null); document.body.style.cursor = ""; },
    },
  };
}

/* ── Solar array: instanced tilted modules ── */
function SolarArray(p: Props) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const rows = 4, cols = 9;
  const h = useHighlight("solar", p);
  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      m.position.set(-8.4 + c * 2.15, 1.1, -4 + r * 2.6);
      m.rotation.set(-0.44, 0, 0);
      m.updateMatrix();
      ref.current!.setMatrixAt(i++, m.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group {...h.handlers}>
      <instancedMesh ref={ref} args={[undefined, undefined, rows * cols]}>
        <boxGeometry args={[1.98, 0.06, 1.62]} />
        <meshStandardMaterial
          color={p.enabled.solar ? "#22314a" : "#121212"}
          metalness={0.35}
          roughness={0.3}
          emissive={h.emissive}
          emissiveIntensity={h.emissiveIntensity}
        />
      </instancedMesh>
      {/* support rails */}
      {Array.from({ length: rows }, (_, r) => (
        <mesh key={r} position={[0.2, 0.5, -4 + r * 2.6 + 0.35]}>
          <boxGeometry args={[18.6, 0.08, 0.08]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Wind turbine ── */
function Turbine({ position, phase, p }: { position: [number, number, number]; phase: number; p: Props }) {
  const rotor = useRef<THREE.Group>(null);
  const h = useHighlight("wind", p);
  useFrame((_, dt) => {
    if (rotor.current && p.enabled.wind) rotor.current.rotation.z += dt * 1.4;
  });
  return (
    <group position={position} {...h.handlers}>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.12, 0.28, 10, 12]} />
        <meshStandardMaterial color="#d9d9d9" metalness={0.3} roughness={0.5} emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
      </mesh>
      <mesh position={[0, 10.05, -0.25]}>
        <boxGeometry args={[0.5, 0.45, 1.3]} />
        <meshStandardMaterial color="#e6e6e6" metalness={0.3} roughness={0.4} emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
      </mesh>
      <group ref={rotor} position={[0, 10.05, 0.48]} rotation={[0, 0, phase]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[0.24, 4, 0.05]} />
              <meshStandardMaterial color="#f2f2f2" roughness={0.45} emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
          <meshStandardMaterial color="#FFE135" emissive={SOLAR} emissiveIntensity={p.enabled.wind ? 0.6 : 0} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Water: cistern + pipe + in-pipe runner housing ── */
function Water(p: Props) {
  const h = useHighlight("water", p);
  const runner = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (runner.current && p.enabled.water) runner.current.rotation.x += dt * 3; });
  const mat = <meshStandardMaterial color="#bfc5cc" metalness={0.7} roughness={0.3} emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />;
  return (
    <group position={[13, 0, 4]} {...h.handlers}>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 3.6, 40]} />
        {mat}
      </mesh>
      <mesh position={[0, 3.65, 0]}>
        <cylinderGeometry args={[1.95, 1.95, 0.1, 40]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-3.2, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 4.4, 20]} />
        {mat}
      </mesh>
      <mesh ref={runner} position={[-3.6, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.55, 0.9, 7]} />
        <meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.3} emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
      </mesh>
      <mesh position={[-3.6, 1.3, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshStandardMaterial color="#111" emissive={p.enabled.water ? SOLAR : new THREE.Color(0)} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Storage(p: Props) {
  const h = useHighlight("storage", p);
  return (
    <group position={[-13, 0, 5]} {...h.handlers}>
      {[0, 1].map((i) => (
        <group key={i} position={[0, 0, i * 3]}>
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[6, 2.6, 2.4]} />
            <meshStandardMaterial color="#e9e9e9" metalness={0.2} roughness={0.55} emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
          </mesh>
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} position={[-2.5 + k, 1.3, 1.21]}>
              <boxGeometry args={[0.05, 2.2, 0.02]} />
              <meshStandardMaterial color="#9c9c9c" />
            </mesh>
          ))}
          <mesh position={[2.6, 2.3, 1.21]}>
            <boxGeometry args={[0.35, 0.12, 0.02]} />
            <meshStandardMaterial color="#FFE135" emissive={SOLAR} emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Distribution(p: Props) {
  const h = useHighlight("distribution", p);
  return (
    <group position={[0, 0, 9]} {...h.handlers}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.4} emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
      </mesh>
      {[-1, 0, 1].map((k) => (
        <mesh key={k} position={[k * 0.8, 2.4, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.8, 10]} />
          <meshStandardMaterial color="#c9c9c9" />
        </mesh>
      ))}
      {[4, 9].map((x) => (
        <group key={x} position={[x, 0, 1.5]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
            <meshStandardMaterial color="#555" emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
          </mesh>
          <mesh position={[0, 5.8, 0]}>
            <boxGeometry args={[1.6, 0.08, 0.08]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Monitoring(p: Props) {
  const h = useHighlight("monitoring", p);
  const beacon = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => { if (beacon.current) beacon.current.emissiveIntensity = 0.6 + 0.6 * Math.max(0, Math.sin(clock.elapsedTime * 2.5)); });
  return (
    <group position={[2, 0, -11]} {...h.handlers}>
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 7, 8]} />
        <meshStandardMaterial color="#9a9a9a" emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
      </mesh>
      <mesh position={[0, 6.4, 0]}>
        <boxGeometry args={[0.9, 0.5, 0.5]} />
        <meshStandardMaterial color="#121212" emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
      </mesh>
      <mesh position={[0, 7.1, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial ref={beacon} color="#FFE135" emissive={SOLAR} />
      </mesh>
      <mesh position={[0.9, 1, 0]}>
        <boxGeometry args={[1, 2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" emissive={h.emissive} emissiveIntensity={h.emissiveIntensity} />
      </mesh>
    </group>
  );
}

/* ── Animated energy flows along curves ── */
function Flow({ points, on, speed = 0.18, count = 8 }: { points: [number, number, number][]; on: boolean; speed?: number; count?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((v) => new THREE.Vector3(...v))), [points]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: "#FF8A00", transparent: true, opacity: 0.25 }));
  }, [curve]);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      const f = (clock.elapsedTime * speed + i / count) % 1;
      curve.getPointAt(f, tmp.position);
      const s = on ? 1 : 0.0001;
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <primitive object={line} visible={on} />
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        <meshBasicMaterial color="#FFE135" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function Ground() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(60, 30, "#2a2a2a", "#1a1a1a");
    (g.material as THREE.Material).transparent = true;
    (g.material as THREE.Material).opacity = 0.6;
    return g;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.95} />
      </mesh>
      <primitive object={grid} position={[0, 0, 0]} />
    </group>
  );
}

function Scene(p: Props) {
  return (
    <>
      <color attach="background" args={["#0b0b0b"]} />
      <fog attach="fog" args={["#0b0b0b", 38, 70]} />
      <hemisphereLight args={["#ffe9c4", "#0b0b0b", 0.55]} />
      <directionalLight position={[-18, 14, 10]} intensity={2.2} color="#ffb347" />
      <directionalLight position={[16, 10, -12]} intensity={0.6} color="#f5f5f5" />
      <Ground />
      <SolarArray {...p} />
      <Turbine position={[-12, 0, -9]} phase={0} p={p} />
      <Turbine position={[-5, 0, -13]} phase={0.7} p={p} />
      <Water {...p} />
      <Storage {...p} />
      <Distribution {...p} />
      <Monitoring {...p} />
      <Flow on={p.enabled.solar} points={[[0, 1.2, 0], [-5, 1.5, 3], [-10, 2.8, 5.5]]} />
      <Flow on={p.enabled.solar} points={[[2, 1.2, 1], [1.5, 1.5, 5], [0, 2.4, 9]]} speed={0.22} />
      <Flow on={p.enabled.wind} points={[[-12, 1, -9], [-13, 1.2, -2], [-13, 2.8, 4.5]]} />
      <Flow on={p.enabled.wind} points={[[-5, 1, -13], [-8, 1.2, -6], [-12, 2.8, 5]]} speed={0.14} />
      <Flow on={p.enabled.water} points={[[9.4, 1.4, 4], [5, 1.4, 7], [1.5, 2.4, 9]]} />
      <Flow on={p.enabled.solar || p.enabled.wind || p.enabled.water} points={[[-10, 2.6, 7], [-5, 2, 9], [-1.5, 2.4, 9]]} speed={0.12} count={10} />
      <Flow on points={[[0, 2.4, 9], [6, 5.8, 10.5], [12, 5.8, 10.5]]} speed={0.2} count={10} />
    </>
  );
}

export default function InstallationScene(p: Props) {
  const [dpr, setDpr] = useState(1.5);
  const isCoarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return (
    <Canvas
      dpr={dpr}
      frameloop={p.active ? "always" : "never"}
      camera={{ position: [26, 20, 30], fov: 34, near: 0.5, far: 200 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => p.onHover(null)}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(isCoarse ? 1.25 : 1.75)} />
      <Scene {...p} />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={22}
        maxDistance={62}
        minPolarAngle={0.35}
        maxPolarAngle={1.32}
        autoRotate={!p.selected}
        autoRotateSpeed={0.35}
        target={[0, 1.5, 0]}
        enableZoom={!isCoarse}
      />
    </Canvas>
  );
}
