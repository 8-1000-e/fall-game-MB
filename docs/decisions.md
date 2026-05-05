# Decisions

## 2026-05-04 — Stack: Vite + React + R3F + drei, versions matched to front-dev

**Decision**: Use Vite + React 18 + React Three Fiber 8.17 + drei 9.114 + three 0.182.

**Context**: New `/Users/emile/Documents/TNTX/fall-game/` prototype, separate from front-dev.

**Rationale**: Matching front-dev's exact versions means components built here can be lifted into front-dev (or vice versa) without dependency-resolution work. R3F 8 + drei 9 + React 18 is a known-good combo; R3F 9 + React 19 would risk the `r3f-react19-nextjs-crash` class of bugs we already have a skill for.

**Alternatives considered**:
- Plain Three.js: rejected — JSX scene authoring is faster and the team is already on R3F.
- Next.js: rejected — overkill for a prototype, and SSR-with-canvas is friction.
- Bun + Vite: not chosen — npm/yarn is what front-dev uses; consistency wins.

---

## 2026-05-04 — Donut is FLAT (annulus), not a torus

**Decision**: Render the "donut" as a flat ring with a hole — `THREE.Shape` outer arc + radial cut + inner arc, extruded on Z and rotated to lie horizontal.

**Context**: User explicitly: "je veux pas que le donut soit rond mais plat, comme un disque avec un trou au milieu, rend pas chaque part d'une couleur differente".

**Rationale**: The character will run on the TOP surface of the ring, so a flat top is easier to anchor onto than a curved torus. Single white color (no per-slice tinting) — the thin gaps between slices are the only visual separator.

**How to apply**: 8 slices via `ExtrudeGeometry` from a `THREE.Shape` (absarc + lineTo + absarc). `OUTER_R=4`, `INNER_R=2`, `THICKNESS=0.35`, `GAP_RAD=0.03`. See [../src/components/Donut.tsx](../src/components/Donut.tsx).

---

## 2026-05-04 — Kube character: rigged limbs, not a static mesh

**Decision**: Author limbs as cylinders wrapped in pivot groups so a parent-driven `phase` prop animates them. Body tilts forward when running. Eyes have white catchlights.

**Context**: User wanted a recognizable Kube (the TNTX mascot — see `front-dev/public/logo` for reference) that VISIBLY runs around the donut, not slides.

**Rationale**: A rigged character sells "running" through limb motion + body bob + body tilt + centripetal lean. A static mesh sliding along the orbit looks like a bug.

**Gotcha**: Arms are horizontal cylinders along ±X. Animating them with X rotation is invisible (rotating a cylinder around its own length-axis). Use Z rotation at the shoulder. See [debugging-notes.md](debugging-notes.md) and the global skill `threejs-cylinder-axis-rotation-invisible`.

---

## 2026-05-04 — Orbital tangent: `r = π − θ`, NOT `θ + π`

**Decision**: Set `group.rotation.y = facing > 0 ? Math.PI - theta : -theta`.

**Context**: User: "ok mais la quand il avance il a pas tout le temps son coter droite vers le milieu du donut, vu qu il tourne sur lui meme". With `θ + π` Kube appeared to spin on himself between cardinal angles.

**Rationale**: Three.js Y rotation gives `forward(r) = (-sin r, 0, -cos r)`. Solving `forward = tangent` for the CCW orbit `(-sin θ, 0, cos θ)` gives `r = π − θ`. The `θ + π` formula matches at multiples of π but mirrors elsewhere.

**Alternatives considered**: rotating an offset arrow mesh (works but cheap-feeling), using `Object3D.lookAt(center)` with offset (works but harder to reason about for the lean). Direct math is the cleanest.

---

## 2026-05-04 — Chart3D in donut center: rejected

**Decision**: Do NOT put a 3D vertical SOL price chart in the donut hole.

**Context**: User asked for the SOL chart from front-dev's airport-carousel game to be ported here as a 3D version going up into the sky from the donut's center. I built it (CatmullRomCurve3 + TubeGeometry, vertical with X = price snake, Y = time, glowing tip sphere). User rejected: "c'est guez mdr, je veux que la chart puisse partir dans les cieux etc, et vrmt au milieux du donut pas juste pose comme une image". I attempted a more dramatic version. User then reverted my changes manually: "j'ai rewind le code mdr pour enlever la chart". File [../src/components/Chart3D.tsx](../src/components/Chart3D.tsx) was deleted from imports — Scene.tsx now contains only `<Donut />` and `<Player />`.

**Rationale**: The chart didn't read as "in the cieux" — it read as a flat-ish line floating awkwardly. The donut center deserves a more spectacular focal point.

**Brainstormed alternatives** (none chosen yet):
- Volcano / pillar of light pulsing with on-chain activity
- Holographic Kube hologram (mascot-as-totem) with floating UI panels
- Vertical column of candlesticks rising from center, each candle = one minute, fading at the top
- Particle stream / fountain whose color & velocity track price direction
- Spinning 3D logo / token with halo
- Portal effect (concentric rings + animated shader) for dramatic "fall" entry

**How to apply**: When the user is ready to revisit, prototype 1-2 of the above (probably volcano + hologram) on a branch and present side-by-side.

---

## (append future decisions below — never edit existing entries)
