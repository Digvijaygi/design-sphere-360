import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Sky, Html, OrthographicCamera, PerspectiveCamera, TransformControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScene, type SceneObject } from "@/lib/scene-store";
import * as THREE from "three";

function matProps(m?: string) {
  switch (m) {
    case "metal":  return { roughness: 0.25, metalness: 0.9 };
    case "glass":  return { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55 };
    case "glossy": return { roughness: 0.15, metalness: 0.3 };
    case "wood":   return { roughness: 0.85, metalness: 0 };
    case "stone":  return { roughness: 0.95, metalness: 0 };
    case "concrete": return { roughness: 1.0, metalness: 0 };
    default: return { roughness: 0.7, metalness: 0.05 };
  }
}

function Mat({ obj, selected }: { obj: SceneObject; selected: boolean }) {
  const p = matProps(obj.material);
  return (
    <meshStandardMaterial
      color={obj.color}
      {...p}
      emissive={selected ? "#ffaa00" : "#000000"}
      emissiveIntensity={selected ? 0.3 : 0}
    />
  );
}

function ObjectMesh({ obj, selected, onClick }: { obj: SceneObject; selected: boolean; onClick: () => void }) {
  if (obj.hidden) return null;
  const common: any = {
    position: obj.position,
    rotation: [0, obj.rotationY, 0] as [number, number, number],
    onClick: (e: any) => { e.stopPropagation(); onClick(); },
    castShadow: true,
    receiveShadow: true,
  };

  switch (obj.kind) {
    case "dome":
      return <mesh {...common}><sphereGeometry args={[obj.size[0] / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat obj={obj} selected={selected} /></mesh>;
    case "column":
      return <mesh {...common}><cylinderGeometry args={[obj.size[0] / 2, obj.size[0] / 2, obj.size[1], 16]} /><Mat obj={obj} selected={selected} /></mesh>;
    case "tree":
      return (
        <group {...common}>
          <mesh position={[0, -obj.size[1] / 2 + 0.4, 0]} castShadow><cylinderGeometry args={[0.1, 0.15, 0.8, 8]} /><meshStandardMaterial color="#5a3a20" /></mesh>
          <mesh position={[0, 0.4, 0]} castShadow><sphereGeometry args={[obj.size[0], 12, 12]} /><Mat obj={obj} selected={selected} /></mesh>
        </group>
      );
    case "plant":
      return (
        <group {...common}>
          <mesh castShadow position={[0, -obj.size[1] / 2 + 0.15, 0]}><cylinderGeometry args={[0.18, 0.22, 0.3, 12]} /><meshStandardMaterial color="#7a4a2a" /></mesh>
          <mesh castShadow position={[0, 0.15, 0]}><sphereGeometry args={[obj.size[0] / 1.6, 10, 10]} /><Mat obj={obj} selected={selected} /></mesh>
        </group>
      );
    case "stair": {
      const steps = 6;
      const sw = obj.size[0]; const sh = obj.size[1] / steps; const sd = obj.size[2] / steps;
      return (
        <group {...common}>
          {Array.from({ length: steps }).map((_, i) => (
            <mesh key={i} castShadow receiveShadow position={[0, -obj.size[1] / 2 + sh / 2 + i * sh, -obj.size[2] / 2 + sd / 2 + i * sd]}>
              <boxGeometry args={[sw, sh, obj.size[2] - i * sd]} />
              <Mat obj={obj} selected={selected} />
            </mesh>
          ))}
        </group>
      );
    }
    case "railing":
      return (
        <group {...common}>
          <mesh castShadow position={[0, obj.size[1] / 2, 0]}><boxGeometry args={[obj.size[0], 0.05, obj.size[2]]} /><Mat obj={obj} selected={selected} /></mesh>
          {Array.from({ length: Math.max(2, Math.floor(obj.size[0])) + 1 }).map((_, i, arr) => {
            const x = -obj.size[0] / 2 + (i / (arr.length - 1)) * obj.size[0];
            return <mesh key={i} castShadow position={[x, 0, 0]}><boxGeometry args={[0.04, obj.size[1], 0.04]} /><Mat obj={obj} selected={selected} /></mesh>;
          })}
        </group>
      );
    case "pool":
      return (
        <group {...common}>
          <mesh receiveShadow position={[0, -obj.size[1] / 4, 0]}><boxGeometry args={[obj.size[0], obj.size[1] / 2, obj.size[2]]} /><meshStandardMaterial color="#0a3a5a" /></mesh>
          <mesh position={[0, obj.size[1] / 4, 0]}><boxGeometry args={[obj.size[0] * 0.98, 0.05, obj.size[2] * 0.98]} /><meshStandardMaterial color={obj.color} transparent opacity={0.7} roughness={0.05} metalness={0.2} /></mesh>
        </group>
      );
    case "car":
      return (
        <group {...common}>
          <mesh castShadow position={[0, 0, 0]}><boxGeometry args={[obj.size[0], obj.size[1] * 0.55, obj.size[2]]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh castShadow position={[0, obj.size[1] * 0.45, -0.2]}><boxGeometry args={[obj.size[0] * 0.85, obj.size[1] * 0.45, obj.size[2] * 0.55]} /><meshStandardMaterial color="#1a1f26" roughness={0.2} /></mesh>
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} castShadow position={[x * obj.size[0] / 2.2, -obj.size[1] / 2, z * obj.size[2] / 2.6]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.25, 0.25, 0.2, 12]} /><meshStandardMaterial color="#111" /></mesh>
          ))}
        </group>
      );
    case "person":
      return (
        <group {...common}>
          <mesh castShadow position={[0, -0.35, 0]}><cylinderGeometry args={[0.18, 0.22, 1, 10]} /><meshStandardMaterial color={obj.color} /></mesh>
          <mesh castShadow position={[0, 0.5, 0]}><sphereGeometry args={[0.2, 12, 12]} /><meshStandardMaterial color="#e6c1a0" /></mesh>
        </group>
      );
    case "streetlamp":
      return (
        <group {...common}>
          <mesh castShadow><cylinderGeometry args={[0.08, 0.1, obj.size[1], 8]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh position={[0, obj.size[1] / 2, 0]}><sphereGeometry args={[0.2, 12, 12]} /><meshStandardMaterial color="#fff7c0" emissive="#fff2a0" emissiveIntensity={1.5} /></mesh>
          <pointLight position={[0, obj.size[1] / 2, 0]} intensity={0.8} distance={8} color="#fff2a0" />
        </group>
      );
    case "fence": {
      const n = Math.max(2, Math.floor(obj.size[0] / 0.3));
      return (
        <group {...common}>
          {Array.from({ length: n }).map((_, i) => {
            const x = -obj.size[0] / 2 + (i / (n - 1)) * obj.size[0];
            return <mesh key={i} castShadow position={[x, 0, 0]}><boxGeometry args={[0.06, obj.size[1], 0.06]} /><Mat obj={obj} selected={selected} /></mesh>;
          })}
          <mesh castShadow position={[0, obj.size[1] * 0.3, 0]}><boxGeometry args={[obj.size[0], 0.06, 0.05]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh castShadow position={[0, -obj.size[1] * 0.3, 0]}><boxGeometry args={[obj.size[0], 0.06, 0.05]} /><Mat obj={obj} selected={selected} /></mesh>
        </group>
      );
    }
    case "bed":
      return (
        <group {...common}>
          <mesh castShadow position={[0, -0.1, 0]}><boxGeometry args={[obj.size[0], obj.size[1] * 0.6, obj.size[2]]} /><meshStandardMaterial color="#3a2a4a" /></mesh>
          <mesh castShadow position={[0, obj.size[1] * 0.15, 0]}><boxGeometry args={[obj.size[0] * 0.98, obj.size[1] * 0.3, obj.size[2] * 0.98]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh castShadow position={[0, obj.size[1] * 0.3, -obj.size[2] * 0.4]}><boxGeometry args={[obj.size[0] * 0.4, 0.15, 0.2]} /><meshStandardMaterial color="#fff" /></mesh>
        </group>
      );
    case "table":
      return (
        <group {...common}>
          <mesh castShadow position={[0, obj.size[1] / 2 - 0.05, 0]}><boxGeometry args={[obj.size[0], 0.1, obj.size[2]]} /><Mat obj={obj} selected={selected} /></mesh>
          {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} castShadow position={[x * obj.size[0] / 2.3, 0, z * obj.size[2] / 2.3]}><boxGeometry args={[0.08, obj.size[1] - 0.1, 0.08]} /><Mat obj={obj} selected={selected} /></mesh>
          ))}
        </group>
      );
    case "chair":
      return (
        <group {...common}>
          <mesh castShadow position={[0, 0, 0]}><boxGeometry args={[obj.size[0], 0.06, obj.size[2]]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh castShadow position={[0, obj.size[1] / 2 - 0.05, -obj.size[2] / 2 + 0.05]}><boxGeometry args={[obj.size[0], obj.size[1], 0.06]} /><Mat obj={obj} selected={selected} /></mesh>
        </group>
      );
    case "tv":
      return (
        <group {...common}>
          <mesh castShadow><boxGeometry args={obj.size} /><meshStandardMaterial color="#000" /></mesh>
          <mesh position={[0, 0, obj.size[2] / 2 + 0.001]}><planeGeometry args={[obj.size[0] * 0.94, obj.size[1] * 0.9]} /><meshStandardMaterial color="#0a2a5a" emissive="#1a5aa0" emissiveIntensity={0.6} /></mesh>
        </group>
      );
    case "fountain":
      return (
        <group {...common}>
          <mesh castShadow><cylinderGeometry args={[obj.size[0] / 2, obj.size[0] / 2, obj.size[1] * 0.3, 24]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh position={[0, obj.size[1] * 0.4, 0]}><cylinderGeometry args={[obj.size[0] * 0.15, obj.size[0] * 0.2, obj.size[1] * 0.6, 16]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh position={[0, obj.size[1] * 0.15, 0]}><cylinderGeometry args={[obj.size[0] * 0.47, obj.size[0] * 0.47, 0.05, 24]} /><meshStandardMaterial color="#7ec8e3" transparent opacity={0.6} /></mesh>
        </group>
      );
    case "statue":
      return (
        <group {...common}>
          <mesh castShadow position={[0, -obj.size[1] * 0.4, 0]}><boxGeometry args={[obj.size[0] * 1.1, obj.size[1] * 0.2, obj.size[2] * 1.1]} /><meshStandardMaterial color="#888" /></mesh>
          <mesh castShadow position={[0, obj.size[1] * 0.05, 0]}><cylinderGeometry args={[obj.size[0] * 0.3, obj.size[0] * 0.4, obj.size[1] * 0.7, 12]} /><Mat obj={obj} selected={selected} /></mesh>
          <mesh castShadow position={[0, obj.size[1] * 0.5, 0]}><sphereGeometry args={[obj.size[0] * 0.28, 16, 16]} /><Mat obj={obj} selected={selected} /></mesh>
        </group>
      );
    case "sign":
      return (
        <group {...common}>
          <mesh castShadow position={[0, -obj.size[1], 0]}><boxGeometry args={[0.1, obj.size[1] * 2, 0.1]} /><meshStandardMaterial color="#333" /></mesh>
          <mesh castShadow><boxGeometry args={obj.size} /><Mat obj={obj} selected={selected} /></mesh>
          <Html position={[0, 0, obj.size[2] / 2 + 0.01]} center distanceFactor={8}><div style={{ background: "transparent", color: "#000", fontWeight: 700, padding: "2px 6px" }}>{obj.label}</div></Html>
        </group>
      );
    case "solar":
      return <mesh {...common} rotation={[-Math.PI / 8, obj.rotationY, 0]}><boxGeometry args={obj.size} /><meshStandardMaterial color={obj.color} metalness={0.7} roughness={0.2} /></mesh>;
    case "kitchen":
    case "bathtub":
    case "sink":
    case "toilet":
    case "sofa":
    case "gate":
    default:
      return <mesh {...common}><boxGeometry args={obj.size} /><Mat obj={obj} selected={selected} /></mesh>;
  }
}

function SunLight() {
  const t = useScene((s) => s.settings.timeOfDay);
  const angle = ((t - 6) / 12) * Math.PI; // 6=sunrise, 18=sunset
  const x = Math.cos(angle) * 20;
  const y = Math.max(0.5, Math.sin(angle) * 20);
  const intensity = Math.max(0.05, Math.sin(angle)) * 1.4;
  return (
    <>
      <directionalLight position={[x, y, 8]} intensity={intensity} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}>
        <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30, 0.5, 80]} />
      </directionalLight>
      <ambientLight intensity={0.3 + Math.max(0, Math.sin(angle)) * 0.3} />
    </>
  );
}

function SkyRig() {
  const t = useScene((s) => s.settings.timeOfDay);
  const angle = ((t - 6) / 12) * Math.PI;
  const x = Math.cos(angle) * 100;
  const y = Math.sin(angle) * 100;
  const z = 20;
  return <Sky sunPosition={[x, Math.max(-5, y), z]} turbidity={t < 6 || t > 19 ? 14 : 6} rayleigh={t < 6 || t > 19 ? 0.5 : 2} />;
}

function FogRig() {
  const fog = useScene((s) => s.settings.fog);
  const { scene } = useThree();
  useEffect(() => { scene.fog = fog > 0 ? new THREE.Fog("#7a8aa0", 10, 10 + (1 - fog) * 80) : null; }, [fog, scene]);
  return null;
}

function ScreenshotRig() {
  const tick = useScene((s) => s.settings.screenshotTick);
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!tick) return;
    gl.render(scene, camera);
    const url = gl.domElement.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = `architectai-${Date.now()}.png`; a.click();
  }, [tick, gl, scene, camera]);
  return null;
}

function CameraSwitcher() {
  const view = useScene((s) => s.settings.viewMode);
  if (view === "top") return <OrthographicCamera makeDefault position={[0, 40, 0]} zoom={30} near={0.1} far={200} />;
  if (view === "front") return <PerspectiveCamera makeDefault position={[0, 8, 28]} fov={45} />;
  if (view === "side") return <PerspectiveCamera makeDefault position={[28, 8, 0]} fov={45} />;
  return <PerspectiveCamera makeDefault position={[14, 12, 16]} fov={50} />;
}

function DimensionsLabel({ obj }: { obj: SceneObject }) {
  return (
    <Html position={[obj.position[0], obj.position[1] + obj.size[1] / 2 + 0.6, obj.position[2]]} center>
      <div style={{ background: "rgba(15,25,42,0.85)", color: "#f5b441", padding: "3px 8px", borderRadius: 4, fontSize: 11, whiteSpace: "nowrap", border: "1px solid #f5b441" }}>
        {obj.label} · {obj.size[0].toFixed(1)}×{obj.size[1].toFixed(1)}×{obj.size[2].toFixed(1)}m
      </div>
    </Html>
  );
}

function TransformGizmo() {
  const selectedId = useScene((s) => s.selectedId);
  const objects = useScene((s) => s.objects);
  const update = useScene((s) => s.update);
  const mode = useScene((s) => s.settings.gizmoMode);
  const viewMode = useScene((s) => s.settings.viewMode);
  const sel = objects.find((o) => o.id === selectedId);
  const proxy = useRef<THREE.Group>(null);
  const [, force] = useState(0);

  useEffect(() => {
    if (!sel || !proxy.current) return;
    proxy.current.position.set(sel.position[0], sel.position[1], sel.position[2]);
    proxy.current.rotation.set(0, sel.rotationY, 0);
    proxy.current.scale.set(1, 1, 1);
    force((n) => n + 1);
  }, [sel?.id]);

  if (!sel || sel.locked || sel.hidden) return <group ref={proxy} />;

  const showRotate = viewMode === "3d" || viewMode === "top";
  const showTranslate = true;
  const actualMode = mode === "rotate" && !showRotate ? "translate" : mode;

  return (
    <>
      <group ref={proxy} />
      {proxy.current && (
        <TransformControls
          object={proxy.current}
          mode={actualMode}
          size={0.9}
          translationSnap={undefined}
          showY={showTranslate}
          onObjectChange={() => {
            const g = proxy.current!;
            const patch: Partial<SceneObject> = {
              position: [g.position.x, Math.max(0, g.position.y), g.position.z],
              rotationY: g.rotation.y,
            };
            if (actualMode === "scale") {
              patch.size = [
                Math.max(0.05, sel.size[0] * g.scale.x),
                Math.max(0.05, sel.size[1] * g.scale.y),
                Math.max(0.05, sel.size[2] * g.scale.z),
              ];
              g.scale.set(1, 1, 1);
            }
            update(sel.id, patch);
          }}
        />
      )}
    </>
  );
}

export function Scene3D() {
  const objects = useScene((s) => s.objects);
  const selectedId = useScene((s) => s.selectedId);
  const select = useScene((s) => s.select);
  const settings = useScene((s) => s.settings);
  const selected = useMemo(() => objects.find((o) => o.id === selectedId), [objects, selectedId]);

  return (
    <Canvas
      shadows
      onPointerMissed={() => select(null)}
      style={{ background: settings.viewMode === "top" ? "#0e1a2b" : "linear-gradient(180deg,#0e1a2b 0%,#1b2a44 100%)" }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <CameraSwitcher />
      {settings.viewMode !== "top" && <SkyRig />}
      <SunLight />
      <FogRig />
      <ScreenshotRig />
      {settings.viewMode !== "top" && <Environment preset="city" />}
      {settings.showGrid && (
        <Grid args={[80, 80]} cellSize={1} cellThickness={0.5} cellColor="#3a5278" sectionSize={5} sectionThickness={1} sectionColor="#f5b441" fadeDistance={80} infiniteGrid position={[0, 0.01, 0]} />
      )}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={settings.groundColor} roughness={1} />
      </mesh>
      {objects.map((o) => (
        <ObjectMesh key={o.id} obj={o} selected={o.id === selectedId} onClick={() => select(o.id)} />
      ))}
      {settings.showDimensions && selected && <DimensionsLabel obj={selected} />}
      <TransformGizmo />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={2} maxDistance={120} maxPolarAngle={settings.viewMode === "top" ? 0.001 : Math.PI / 2 - 0.02} />
    </Canvas>
  );
}

