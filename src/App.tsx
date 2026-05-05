import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";

export default function App() {
  return (
    <Canvas
      shadows
      // 3/4 view: camera up + offset, looking down at the platform.
      camera={{ position: [7, 6, 9], fov: 35 }}
      gl={{ antialias: true }}
      style={{ width: "100vw", height: "100vh" }}
    >
      <Scene />
    </Canvas>
  );
}
