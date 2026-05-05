# Debugging Notes

## 2026-05-04 — Kube "spinning on himself" while orbiting (heading formula bug)

### Symptoms
- Kube orbits the donut correctly position-wise (always on the ring)
- But his right side does NOT consistently point toward the donut's center
- Visual: looks like he's both orbiting AND spinning in place
- User: "ok mais la quand il avance il a pas tout le temps son coter droite vers le milieu du donut, vu qu il tourne sur lui meme"

### Root cause
Used `group.rotation.y = theta + Math.PI` to make Kube face the orbital tangent.
This formula gives the correct heading at θ ∈ {0, π/2, π, 3π/2} but is mirrored
everywhere else. Why: Three.js Y rotation applied to default forward (0,0,−1)
gives `forward(r) = (-sin r, 0, -cos r)`. The CCW orbital tangent at angle θ
is `(-sin θ, 0, cos θ)`. Solving `forward(r) = tangent` gives `r = π − θ`,
NOT `θ + π`.

### Fix
[../src/components/Player.tsx:137](../src/components/Player.tsx#L137):
```ts
group.rotation.y = facingRef.current > 0 ? Math.PI - t : -t;
```

For backward (CW) motion, the tangent is `(sin θ, 0, -cos θ)` → `r = -θ`.

### Gotcha
The bug is invisible if you spot-check at θ = 0 or θ = π (cardinal alignment
masks it). You only see it during continuous motion between cardinal points.

### Generalized
Promoted to global skill `threejs-orbital-tangent-rotation` —
`~/.claude/skills/brain-dump/extracted/threejs-orbital-tangent-rotation/SKILL.md`.

---

## 2026-05-04 — Arms not animating despite rotation prop changing

### Symptoms
- Legs swing forward/back as expected
- Arms appear COMPLETELY frozen
- `console.log`-ing the rotation prop confirms it's changing every frame
- User: "fais bouger ses bras aussi"

### Root cause
Arms were modeled as horizontal cylinders laid along ±X (via `rotation=[0,0,π/2]`
on the inner mesh). Tried to "swing" them by rotating the parent group on X —
but X is the cylinder's own length-axis. Cylinders are rotationally symmetric
about their length, so rotation around that axis is invisible.

### Fix
Use Z rotation at the shoulder (perpendicular to the arm's length, in the XY
plane), which produces a vertical pump motion:
[../src/components/Kube.tsx:114](../src/components/Kube.tsx#L114):
```tsx
<group position={[pivotX, pivotY, 0]} rotation={[0, 0, rotationZ]}>
  <mesh position={[(sign * ARM_LEN) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
    <cylinderGeometry args={[ARM_R, ARM_R, ARM_LEN, 12]} />
  </mesh>
</group>
```

Bonus: because both arms use the same `armSwing` value but extend in opposite
±X directions, the same Z rotation lifts one hand while dropping the other —
free alternating pump.

### Generalized
Promoted to global skill `threejs-cylinder-axis-rotation-invisible` —
`~/.claude/skills/brain-dump/extracted/threejs-cylinder-axis-rotation-invisible/SKILL.md`.

---

## 2026-05-04 — Lean axis wandering as Kube goes around the ring (avoided by group nesting)

### What we avoided
Tried initially: apply both heading (Y) and lean (Z) on the same group. Result:
the "Z" axis is in the parent (world) frame, so lean direction shifts as Kube
moves around the ring — at θ = 0 he leans left/right, at θ = π/2 he leans
forward/back. Wobble, not bank.

### Fix (preventive)
Two nested groups in [../src/components/Player.tsx](../src/components/Player.tsx):
- Outer group: world position + Y heading rotation
- Inner group: Z rotation for lean

Applying lean on the inner group means Z is in Kube's LOCAL frame, evaluated
AFTER the heading rotation. "Inward" stays inward all the way around.

### Smoothing
Lean target snaps when keys press/release. Used `MathUtils.damp` (rad/s smoothing
constant `LEAN_LERP=8`) to prevent jarring snaps at start/stop/reverse.
