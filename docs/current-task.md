# Current Task

## What's done (visual prototype)

The Vite + R3F app at [src/](../src/) renders a complete scene:

- [src/Scene.tsx](../src/Scene.tsx) — sky-blue background, ambient + key light + fill light, mounts `<Donut />` and `<Player />`. OrbitControls is intentionally enabled in [src/App.tsx](../src/App.tsx) for prototyping (remove when camera becomes gameplay-driven).
- [src/components/Donut.tsx](../src/components/Donut.tsx) — flat 8-segment ring (annulus), white slices with thin gaps. Built from `THREE.Shape` + `ExtrudeGeometry` per slice. Constants: `OUTER_R=4`, `INNER_R=2`, `THICKNESS=0.35`, `GAP_RAD=0.03`.
- [src/components/Kube.tsx](../src/components/Kube.tsx) — the TNTX mascot. RoundedBox body (`SIZE=0.4`, `CORNER_R=0.08`, `BODY_COLOR=#c8e864`). Almond eyes with white catchlight via scaled spheres. Half-torus smile. Arms (horizontal cylinders, Z rotation at shoulder) and legs (vertical cylinders, X rotation at hip). Body tilts forward `BODY_LEAN_FORWARD=0.12rad` while running.
- [src/components/Player.tsx](../src/components/Player.tsx) — orbital controller. Tracks `thetaRef` (angular position), `facingRef` (+1 CCW / -1 CW), `gaitPhaseRef` (limb phase), `leanRef` (smoothed centripetal lean). Outer group does position + heading; inner group does the lean (so lean stays in Kube's local frame).

## What's next

**Decide what fills the donut hole.** The user prototyped a vertical 3D SOL-price chart and rejected it. Brainstormed alternatives are in [decisions.md](decisions.md). The slot is reserved at world origin (0, ~0, 0); the hole's inner radius is 2.

Once that's decided, two follow-on tracks:

1. **Game mechanic** — the name "fall-game" implies a fall/loss condition. Likely: Kube can fall off the ring (slide outside `OUTER_R` or inside `INNER_R`), or something rises from the center to push him. Not designed yet.
2. **On-chain wiring** — the `programs/`, `programs-ecs/`, `Anchor.toml` skeleton is from `bolt init` and untouched. When game design firms up, ECS components/systems get authored there. Frontend can mock state via a hook similar to front-dev's `useSolPrice`.

## How to run

```bash
cd fall-game
npm install   # or yarn — both lockfiles present, prefer one
npm run dev
```

Vite serves on the default 5173. The app full-screens itself via the `html, body, #root { height: 100% }` style block in [index.html](../index.html).

## Open questions

- Are we keeping the Bolt ECS skeleton, or will fall-game be pure-frontend / use a different on-chain pattern?
- Should the camera become gameplay-driven (e.g., orbit-following) or stay free-look during dev?
- What's the loss condition?
