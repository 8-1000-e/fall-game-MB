import { RoundedBox } from "@react-three/drei";

/**
 * Kube — the TNTX mascot. Rounded chartreuse cube body + 2 black almond
 * eyes (each with a tiny white catchlight) + smile + 2 stubby arms on
 * the sides + 2 stubby legs underneath.
 *
 * Limbs are wrapped in groups whose origins are at the JOINT (shoulder
 * for arms, hip for legs) so a parent-driven `phase` prop can swing
 * them around that pivot — same trick as a real skeleton rig but in
 * three lines of group nesting.
 *
 *   - Legs swing forward/back via X rotation at the hip (cylinder hangs
 *     along -Y, X rotation moves the foot in the YZ plane).
 *   - Arms pump up/down via Z rotation at the shoulder (cylinder
 *     extends along ±X, Z rotation moves the hand in the XY plane).
 *
 * X rotation on horizontal arms would be invisible (rotation around the
 * cylinder's own axis), which is why an earlier version had the legs
 * swinging but the arms looking frozen.
 *
 * Local origin = body center. The legs extend BELOW y=0; the parent
 * (Player) accounts for this when placing the character on the ring so
 * the feet touch the surface.
 */

// Body
const SIZE = 0.4;
const CORNER_R = 0.08;
const BODY_COLOR = "#c8e864";
const FEATURE_COLOR = "#2a2418";

// Limbs
const ARM_LEN = 0.2;
const ARM_R = 0.05;
const LEG_LEN = 0.2;
const LEG_R = 0.06;

// Animation amplitudes (radians)
const LEG_SWING_AMPLITUDE = 0.55; // ~31°
const ARM_SWING_AMPLITUDE = 0.5; // ~28°
const BODY_LEAN_FORWARD = 0.12; // ~7°

export const KUBE_BODY_SIZE = SIZE;
export const KUBE_LEG_LEN = LEG_LEN;

interface KubeProps {
  /** Animation phase in radians. Drives the leg + arm swing. */
  phase?: number;
  /** When false, limbs return to rest pose and the body un-tilts. */
  isMoving?: boolean;
}

export default function Kube({ phase = 0, isMoving = false }: KubeProps) {
  const swing = isMoving ? Math.sin(phase) : 0;
  const legSwing = swing * LEG_SWING_AMPLITUDE;
  const armSwing = swing * ARM_SWING_AMPLITUDE;
  const bodyTilt = isMoving ? -BODY_LEAN_FORWARD : 0;

  const FACE_Z = -SIZE / 2 - 0.001;

  return (
    <group>
      {/* BODY (with face features). Tilts forward when running. */}
      <group rotation={[bodyTilt, 0, 0]}>
        <RoundedBox
          args={[SIZE, SIZE, SIZE]}
          radius={CORNER_R}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={BODY_COLOR} roughness={0.55} metalness={0.05} />
        </RoundedBox>

        <Eye position={[-0.085, 0.03, FACE_Z]} />
        <Eye position={[0.085, 0.03, FACE_Z]} />

        <mesh position={[0, -0.06, FACE_Z]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.045, 0.009, 8, 16, Math.PI]} />
          <meshStandardMaterial color={FEATURE_COLOR} roughness={0.4} />
        </mesh>
      </group>

      {/* ARMS — pump up/down (Z rotation at shoulder). Both arms use
          the SAME armSwing → because the left arm extends in -X and
          the right arm in +X, applying the same Z rotation makes one
          go up while the other goes down. Natural alternating pump. */}
      <Arm pivotX={-(SIZE / 2)} pivotY={-0.04} rotationZ={armSwing} />
      <Arm pivotX={SIZE / 2} pivotY={-0.04} rotationZ={armSwing} />

      {/* LEGS — swing forward/back (X rotation at hip). Opposite signs
          so left and right alternate. */}
      <Leg pivotX={-0.09} pivotY={-(SIZE / 2)} rotationX={legSwing} />
      <Leg pivotX={0.09} pivotY={-(SIZE / 2)} rotationX={-legSwing} />
    </group>
  );
}

/** Horizontal arm: extends outward from the shoulder along ±X. The
 *  parent group's Z rotation pumps the hand up/down around the
 *  shoulder pivot. */
function Arm({
  pivotX,
  pivotY,
  rotationZ,
}: {
  pivotX: number;
  pivotY: number;
  rotationZ: number;
}) {
  const sign = Math.sign(pivotX) || 1;
  return (
    <group position={[pivotX, pivotY, 0]} rotation={[0, 0, rotationZ]}>
      {/* Inner Z rotation lays the cylinder horizontal; position
          offsets it half a length further outward so the inner end
          sits flush at the shoulder pivot. */}
      <mesh
        position={[(sign * ARM_LEN) / 2, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[ARM_R, ARM_R, ARM_LEN, 12]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.55} metalness={0.05} />
      </mesh>
    </group>
  );
}

/** Vertical leg: hangs straight down from the hip. The parent group's
 *  X rotation swings the foot forward/back around the hip pivot. */
function Leg({
  pivotX,
  pivotY,
  rotationX,
}: {
  pivotX: number;
  pivotY: number;
  rotationX: number;
}) {
  return (
    <group position={[pivotX, pivotY, 0]} rotation={[rotationX, 0, 0]}>
      <mesh position={[0, -LEG_LEN / 2, 0]} castShadow>
        <cylinderGeometry args={[LEG_R, LEG_R, LEG_LEN, 12]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.55} metalness={0.05} />
      </mesh>
    </group>
  );
}

/** Single eye: black almond pupil + tiny white catchlight at top-left. */
function Eye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh scale={[1, 1.3, 0.35]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={FEATURE_COLOR} roughness={0.4} />
      </mesh>
      <mesh position={[-0.011, 0.014, 0.014]} scale={[1, 1, 0.4]}>
        <sphereGeometry args={[0.011, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
