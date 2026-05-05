# Architecture

## High level

Two parallel tracks coexist in this repo:

```
fall-game/
├── src/                    ← Vite + React + R3F frontend (active)
├── programs/               ← Anchor program (skeleton, untouched)
├── programs-ecs/           ← Bolt ECS components/systems (skeleton, untouched)
│   ├── components/
│   ├── systems/
│   └── crates/
├── migrations/             ← Anchor deploy scripts (default)
├── tests/                  ← Anchor mocha tests (default)
├── Anchor.toml, Cargo.toml ← from `bolt init`
├── index.html, vite.config.ts, package.json ← Vite app
└── tsconfig*.json
```

Only the Vite app is wired up. The Anchor/Bolt skeleton is dormant — kept so the
prototype can grow into an on-chain game without re-scaffolding.

## Frontend scene graph

```
<Canvas> (drei OrbitControls free-look enabled in App.tsx)
└── <Scene>
    ├── <color attach="background"> #bcdcff (sky)
    ├── <ambientLight> #dde9ff
    ├── <directionalLight> key, casts shadows (2048² shadow map)
    ├── <directionalLight> opposite-side fill
    ├── <Donut>
    │   └── 8× <mesh geometry={annularSliceGeometry}> rotated by i·(2π/8)
    └── <Player>
        └── <group ref={groupRef}>      ← position + heading (Y rotation)
            └── <group ref={tiltRef}>   ← centripetal lean (Z rotation)
                └── <Kube phase isMoving>
                    ├── <group rotation=[bodyTilt, 0, 0]>  ← forward run-tilt
                    │   ├── <RoundedBox> body
                    │   ├── <Eye/> ×2
                    │   └── <mesh torus> smile
                    ├── <Arm> ×2 — Z rotation at shoulder pivot
                    └── <Leg> ×2 — X rotation at hip pivot, opposite signs
```

## Why three layers of nested groups in Player

1. **Outer group** — sets world position on the ring (cos/sin θ) and heading
   (Y rotation). Everything below inherits the orbital position and "facing
   forward" basis.
2. **Inner tilt group** — applies the centripetal lean as a Z rotation. Must
   be inside the heading-rotated group so "Z" stays in Kube's local frame as
   he goes around — otherwise the lean axis would shift with θ and produce a
   wobble instead of a steady inward bank.
3. **Kube body tilt group** — separate from the lean; this is the
   forward-pitch-while-running animation, not orbital banking.

## Animation clocks

`Player.useFrame` is the single tick. It:
- Reads `keysRef` (mutated by global keydown/keyup listeners)
- Advances `thetaRef` (orbital angle) and `gaitPhaseRef` (limb phase)
- Smooths `leanRef` toward target via `MathUtils.damp`
- Writes `position`, `rotation.y`, `tilt.rotation.z`
- Pushes `gaitPhaseRef` value into React state (`renderPhase`) so Kube's props
  re-render with the new phase

The state-write per frame is a known small inefficiency — the alternative is
`useFrame` inside Kube reading a parent ref, but the prop pattern is simpler
and 60Hz state updates are fine for a single component.

## Key constants (single source of truth where they touch other components)

- [Donut.tsx](../src/components/Donut.tsx): `OUTER_R=4`, `INNER_R=2`, `THICKNESS=0.35`
- [Kube.tsx](../src/components/Kube.tsx) (exported): `KUBE_BODY_SIZE=0.4`, `KUBE_LEG_LEN=0.2`
- [Player.tsx](../src/components/Player.tsx): `RING_R=3` (mid-radius — must match Donut's INNER/OUTER), `RING_TOP_Y = THICKNESS/2 = 0.175`, `Y_ON_RING = RING_TOP_Y + KUBE_LEG_LEN + KUBE_BODY_SIZE/2`

If you change the donut thickness or radii, update `RING_R` and `RING_TOP_Y`
in Player to match — there's no shared constants module yet (would be a good
first refactor when adding more elements).

## What's intentionally absent

- No Zustand / Redux — refs + local state are enough
- No physics engine — orbital motion is parametric, not simulated
- No asset loading — everything is procedural meshes
- No audio
- No on-chain integration — Anchor skeleton is dormant
