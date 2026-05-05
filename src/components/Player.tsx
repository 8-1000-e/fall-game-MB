import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import Kube, { KUBE_BODY_SIZE, KUBE_LEG_LEN } from "./Kube";

/**
 * Player — Kube ORBITING the ring. Tracks an angular position (theta)
 * around the ring's mid-radius; movement keys nudge theta, which
 * physically translates the character along the ring's circumference
 * (this is real orbital motion — Kube is NOT spinning in place).
 *
 * Three things are layered to make the motion feel like a real run:
 *   1. Position → on the ring at angle theta
 *   2. Heading  → body rotates Y to face the orbital tangent so Kube
 *                 always faces the direction it's running
 *   3. Lean     → body tilts Z toward the ring's center (centripetal),
 *                 like a cyclist banking into a curve. Sells the orbit.
 *   + Limbs swing via a `phase` clock passed to Kube, and the body
 *     bobs up/down — together they read as "running", not "sliding".
 *
 * Controls (covers QWERTY + AZERTY + arrow keys):
 *   - Forward (CCW around ring): W, Z, ArrowUp
 *   - Backward (CW around ring): S, ArrowDown
 */

// Ring geometry (must match Donut.tsx)
const RING_R = 3; // mid-radius (between INNER 2 and OUTER 4)
const RING_TOP_Y = 0.35 / 2; // ring THICKNESS / 2 → top surface

// Y of the BODY CENTER — Kube's local origin is the body center; legs
// hang below. Lift the origin so the bottom of the legs touches the ring.
const Y_ON_RING = RING_TOP_Y + KUBE_LEG_LEN + KUBE_BODY_SIZE / 2;

// Motion tuning
const TURN_SPEED = 1.5; // rad/s — about 4.5 units/s tangential at R=3
const STRIDE_HZ = 2.2; // strides per second (one full sin cycle = 2 leg cycles)
const BOB_AMPLITUDE = 0.05;
const LEAN_AMOUNT = 0.18; // radians inward (~10°) at full speed
const LEAN_LERP = 8; // rad/s smoothing for lean changes (no snap)

const FORWARD_KEYS = new Set(["KeyW", "KeyZ", "ArrowUp"]);
const BACKWARD_KEYS = new Set(["KeyS", "ArrowDown"]);

export default function Player() {
  const groupRef = useRef<Group>(null);
  /** Inner group so the lean (Z rotation) is applied AFTER the
   *  orbital heading (Y rotation on the outer group). Otherwise the
   *  lean axis would shift as the heading changes. */
  const tiltRef = useRef<Group>(null);

  /** Angular position around the ring (radians). */
  const thetaRef = useRef(0);
  /** +1 = facing CCW (forward), -1 = facing CW (backward). Sticky so
   *  the body doesn't snap-rotate when keys are released. */
  const facingRef = useRef(1);
  /** Phase of the running gait (radians). Drives leg + arm swing
   *  inside Kube. Only advances while moving. */
  const gaitPhaseRef = useRef(0);
  /** Smoothed lean angle (rad). Lerps toward target each frame. */
  const leanRef = useRef(0);

  /** React state mirror of "is the character currently moving" — used
   *  to pass `isMoving` to Kube for the limb-swing on/off. Updated
   *  in the keyboard listeners. */
  const [isMoving, setIsMoving] = useState(false);
  /** Phase exposed to Kube via state so its props update each frame. */
  const [renderPhase, setRenderPhase] = useState(0);

  /** Held-keys state, mutated by the global key listeners. */
  const keysRef = useRef({ forward: false, backward: false });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (FORWARD_KEYS.has(e.code)) {
        keysRef.current.forward = true;
        if (e.code === "ArrowUp") e.preventDefault();
      }
      if (BACKWARD_KEYS.has(e.code)) {
        keysRef.current.backward = true;
        if (e.code === "ArrowDown") e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (FORWARD_KEYS.has(e.code)) keysRef.current.forward = false;
      if (BACKWARD_KEYS.has(e.code)) keysRef.current.backward = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const { forward, backward } = keysRef.current;
    let dir = 0;
    if (forward) dir += 1;
    if (backward) dir -= 1;
    const moving = dir !== 0;

    if (moving) {
      thetaRef.current += TURN_SPEED * delta * dir;
      facingRef.current = dir;
      gaitPhaseRef.current += delta * STRIDE_HZ * Math.PI * 2;
    }

    // Lerp the centripetal lean toward its target. -dir × LEAN means the
    // tilt direction matches the orbit direction (lean inward whether
    // CCW or CW). The smoothing prevents a snap when the user starts /
    // stops or reverses.
    const targetLean = moving ? -facingRef.current * LEAN_AMOUNT : 0;
    leanRef.current = MathUtils.damp(leanRef.current, targetLean, LEAN_LERP, delta);

    const t = thetaRef.current;
    const g = groupRef.current;
    const tilt = tiltRef.current;
    if (!g || !tilt) return;

    // Position on the ring + bob. The bob uses |sin| so each footfall
    // gives one upward push (not a smooth wave around 0).
    const bob = moving ? Math.abs(Math.sin(gaitPhaseRef.current)) * BOB_AMPLITUDE : 0;
    g.position.set(RING_R * Math.cos(t), Y_ON_RING + bob, RING_R * Math.sin(t));

    // Heading on the OUTER group — Y-rotation that aligns Kube's
    // forward (-Z by default) with the orbital tangent.
    //
    // In Three.js, rotating a vector v=(0,0,-1) by Y angle r yields
    // forward = (-sin r, 0, -cos r). Solving forward = tangent gives:
    //   - CCW tangent (-sin θ, 0, cos θ)  → r = π - θ
    //   - CW  tangent ( sin θ, 0,-cos θ)  → r = -θ
    //
    // The earlier `r = θ + π` formula matched at multiples of π but
    // mirrored Kube's heading the rest of the time, so his "right
    // side" no longer pointed toward the ring's center as he moved —
    // exactly the "spinning on himself" symptom.
    g.rotation.y = facingRef.current > 0 ? Math.PI - t : -t;

    // Lean on the INNER group — applied in Kube's local frame, AFTER
    // the heading rotation, so "inward" stays inward as we go around.
    tilt.rotation.z = leanRef.current;

    // Push phase to Kube's render props (keeps the limbs swinging in
    // sync with the bob). Pre-cleared when not moving so the limbs
    // freeze in their rest pose at the instant the user releases keys.
    if (moving) setRenderPhase(gaitPhaseRef.current);
    setIsMoving(moving);
  });

  return (
    <group ref={groupRef}>
      <group ref={tiltRef}>
        <Kube phase={renderPhase} isMoving={isMoving} />
      </group>
    </group>
  );
}
