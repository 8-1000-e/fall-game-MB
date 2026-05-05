import { useMemo } from "react";
import * as THREE from "three";

/**
 * Flat ring (annulus) with a hole in the middle, split into N slices.
 *
 * Each slice is an extruded annular sector (Shape + ExtrudeGeometry):
 * outer arc + radial cut + inner arc back to start, then extruded on Z
 * and rotated -π/2 on X so the ring lies horizontal. Per-slice spin is
 * applied on the mesh's Y axis. All slices share the same color — the
 * thin gap between them is the only visual separator.
 */
const SEGMENT_COUNT = 8;
const OUTER_R = 4;
const INNER_R = 2;
const THICKNESS = 0.35;
// Angular gap between slices, in radians. Bigger = more visible cuts.
const GAP_RAD = 0.03;
const SLICE_COLOR = "#ffffff";

export default function Donut() {
  const sliceGeometry = useMemo(() => {
    const arc = (Math.PI * 2) / SEGMENT_COUNT;
    const sliceArc = arc - GAP_RAD;

    const shape = new THREE.Shape();
    // Outer edge — sweep CCW from angle 0 to sliceArc.
    shape.absarc(0, 0, OUTER_R, 0, sliceArc, false);
    // Cut radially inward to the inner radius at the end angle.
    shape.lineTo(INNER_R * Math.cos(sliceArc), INNER_R * Math.sin(sliceArc));
    // Inner edge — sweep CW back to angle 0 (closes the wedge).
    shape.absarc(0, 0, INNER_R, sliceArc, 0, true);
    // Implicit lineTo to start point closes the shape.

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: THICKNESS,
      bevelEnabled: false,
      curveSegments: 32,
    });
    // Center on Z (the extrude axis) then lay flat: extrude axis → world up.
    geo.translate(0, 0, -THICKNESS / 2);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const arcPerSlice = (Math.PI * 2) / SEGMENT_COUNT;

  return (
    <group>
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
        <mesh
          key={i}
          geometry={sliceGeometry}
          rotation={[0, i * arcPerSlice, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={SLICE_COLOR} roughness={0.6} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}
