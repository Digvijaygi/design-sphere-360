import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Sky } from "@react-three/drei";
import { useScene, type SceneObject } from "@/lib/scene-store";

function ObjectMesh({ obj, selected, onClick }: { obj: SceneObject; selected: boolean; onClick: () => void }) {
  const common = {
    position: obj.position,
    rotation: [0, obj.rotationY, 0] as [number, number, number],
    onClick: (e: any) => { e.stopPropagation(); onClick(); },
    castShadow: true,
    receiveShadow: true,
  };

  const mat = (
    <meshStandardMaterial
      color={obj.color}
      roughness={0.7}
      metalness={0.05}
      emissive={selected ? "#ffaa00" : "#000000"}
      emissiveIntensity={selected ? 0.25 : 0}
    />
  );

  if (obj.kind === "dome") {
    return (
      <mesh {...common}>
        <sphereGeometry args={[obj.size[0] / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {mat}
      </mesh>
    );
  }
  if (obj.kind === "tree") {
    return (
      <group {...common}>
        <mesh position={[0, -obj.size[1] / 2 + 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#5a3a20" />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <sphereGeometry args={[obj.size[0], 12, 12]} />
          <meshStandardMaterial color={obj.color} roughness={0.9} emissive={selected ? "#ffaa00" : "#000"} emissiveIntensity={selected ? 0.2 : 0} />
        </mesh>
      </group>
    );
  }
  if (obj.kind === "column") {
    return (
      <mesh {...common}>
        <cylinderGeometry args={[obj.size[0] / 2, obj.size[0] / 2, obj.size[1], 16]} />
        {mat}
      </mesh>
    );
  }
  return (
    <mesh {...common}>
      <boxGeometry args={obj.size} />
      {mat}
    </mesh>
  );
}

export function Scene3D() {
  const objects = useScene((s) => s.objects);
  const selectedId = useScene((s) => s.selectedId);
  const select = useScene((s) => s.select);

  return (
    <Canvas
      shadows
      camera={{ position: [12, 10, 14], fov: 50 }}
      onPointerMissed={() => select(null)}
      style={{ background: "linear-gradient(180deg,#0e1a2b 0%,#1b2a44 100%)" }}
    >
      <Sky sunPosition={[10, 5, 10]} turbidity={6} rayleigh={2} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="city" />
      <Grid
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3a5278"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#f5b441"
        fadeDistance={50}
        infiniteGrid
        position={[0, 0.01, 0]}
      />
      {objects.map((o) => (
        <ObjectMesh
          key={o.id}
          obj={o}
          selected={o.id === selectedId}
          onClick={() => select(o.id)}
        />
      ))}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />
    </Canvas>
  );
}
