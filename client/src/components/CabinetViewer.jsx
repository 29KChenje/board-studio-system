import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";

const scale = 0.002;

const Panel = ({ panel }) => (
  <mesh position={[panel.position.x * scale, panel.position.y * scale, panel.position.z * scale]} castShadow receiveShadow>
    <boxGeometry args={[panel.width * scale, panel.height * scale, panel.depth * scale]} />
    <meshStandardMaterial color={panel.type === "back" ? "#d6c5a4" : "#e8d8b8"} roughness={0.5} metalness={0.05} />
  </mesh>
);

const CabinetViewer = ({ model }) => {
  if (!model) {
    return <div className="viewer-placeholder">Select a project to preview the cabinet in 3D.</div>;
  }

  return (
    <div className="viewer-card">
      <Canvas camera={{ position: [2.5, 2, 3], fov: 45 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 3]} intensity={1.2} castShadow />
        {model.panels.map((panel) => <Panel key={panel.id} panel={panel} />)}
        <Environment preset="city" />
        <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={6} blur={2} />
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};

export default CabinetViewer;
