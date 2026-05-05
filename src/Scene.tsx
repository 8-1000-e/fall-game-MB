import Donut from "./components/Donut";
import Player from "./components/Player";

/**
 * The 3D scene: a segmented donut floating against a light blue sky,
 * lit from above-ish so the 3/4 angle reads cleanly. OrbitControls is
 * on so we can spin around during prototyping — remove later when the
 * camera becomes gameplay-driven.
 */
export default function Scene() {
  return (
    <>
      {/* Solid sky-blue background — matches the body bg so canvas
          edges are invisible. */}
      <color attach="background" args={["#bcdcff"]} />

      {/* Bright ambient — the light bg means we don't want crushed
          shadows on the donut's underside. */}
      <ambientLight intensity={0.7} color="#dde9ff" />
      {/* Key light — warm, upper-front-right. Casts shadows. */}
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.6}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />
      {/* Soft fill from the opposite side — keeps the slices on the
          shadowed half from going muddy against the light bg. */}
      <directionalLight position={[-6, 4, -8]} intensity={0.5} color="#bcdcff" />

      <Donut />
      <Player />
    </>
  );
}
