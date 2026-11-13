"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { MARK_SHAPES, type BrandShape } from "./brand-shapes"

/* ------------------------------------------------------------------ *
 * BALAND living mark â€” the logo assembled from thousands of glowing
 * particles. Each brand colour lives on its own depth layer so the
 * mark reads as a sculpture when it tilts toward the pointer.
 * ------------------------------------------------------------------ */

const GLOW: Record<BrandShape["color"], THREE.Color> = {
  navy: new THREE.Color("#4d90ff"),
  teal: new THREE.Color("#1fd0aa"),
  orange: new THREE.Color("#ff9a2e"),
}
const LAYER_Z: Record<BrandShape["color"], number> = { navy: -0.06, teal: 0.02, orange: 0.12 }

function polyArea(pts: [number, number][]) {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    a += x1 * y2 - x2 * y1
  }
  return Math.abs(a / 2)
}

function inside(pts: [number, number][], x: number, y: number) {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** deterministic PRNG so server/client & re-renders agree */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildGeometry(count: number) {
  const rand = mulberry32(7)
  const areas = MARK_SHAPES.map((s) => polyArea(s.pts))
  const total = areas.reduce((a, b) => a + b, 0)

  const pos = new Float32Array(count * 3)
  const start = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const size = new Float32Array(count)
  const white = new THREE.Color("#fff6e8")

  let i = 0
  MARK_SHAPES.forEach((shape, si) => {
    const n = si === MARK_SHAPES.length - 1 ? count - i : Math.round((areas[si] / total) * count)
    const xs = shape.pts.map((p) => p[0])
    const ys = shape.pts.map((p) => p[1])
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    const edgeShare = 0.28
    for (let k = 0; k < n && i < count; k++, i++) {
      let x = 0
      let y = 0
      if (rand() < edgeShare) {
        // crisp outline: sample along the polygon edge
        const e = Math.floor(rand() * shape.pts.length)
        const [ax, ay] = shape.pts[e]
        const [bx, by] = shape.pts[(e + 1) % shape.pts.length]
        const t = rand()
        x = ax + (bx - ax) * t
        y = ay + (by - ay) * t
      } else {
        let guard = 0
        do {
          x = minX + rand() * (maxX - minX)
          y = minY + rand() * (maxY - minY)
        } while (!inside(shape.pts, x, y) && guard++ < 200)
      }
      const z = LAYER_Z[shape.color] + (rand() - 0.5) * 0.06
      pos.set([x, y, z], i * 3)

      // start: a wide, slightly flattened swirl around the mark
      const r = 1.6 + rand() * 2.6
      const a = rand() * Math.PI * 2
      start.set([Math.cos(a) * r, Math.sin(a) * r * 0.62, (rand() - 0.5) * 3], i * 3)

      const c = rand() < 0.07 ? white : GLOW[shape.color]
      const shade = 0.9 + rand() * 0.5
      col.set([c.r * shade, c.g * shade, c.b * shade], i * 3)
      seed[i] = rand()
      size[i] = 0.6 + Math.pow(rand(), 3) * 2.4
    }
  })

  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  g.setAttribute("aStart", new THREE.BufferAttribute(start, 3))
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3))
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1))
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1))
  return g
}

const vertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uProgress;
  uniform float uExit;
  uniform float uPixelRatio;
  uniform float uBase;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = clamp(uProgress * 1.7 - aSeed * 0.7, 0.0, 1.0);
    d = 1.0 - pow(1.0 - d, 3.0);

    vec3 target = position;
    target.x += sin(uTime * 0.8 + aSeed * 40.0) * 0.004;
    target.y += cos(uTime * 0.7 + aSeed * 31.0) * 0.004;
    target.z += sin(uTime * 0.6 + aSeed * 17.0) * 0.025;

    // swirl in from the start cloud
    float ang = (1.0 - d) * (2.4 + aSeed * 1.5);
    vec3 s = aStart;
    s.xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * s.xy;
    vec3 p = mix(s, target, d);

    // pointer: gentle repulsion + lift toward the viewer
    vec2 diff = p.xy - uPointer.xy;
    float dist = length(diff);
    float f = smoothstep(0.32, 0.0, dist) * uPointerStrength * d;
    p.xy += normalize(diff + 1e-5) * f * 0.09;
    p.z += f * 0.25;

    // exit: blow outward toward the camera
    float e = uExit * uExit;
    p += normalize(aStart + vec3(0.0, 0.0, 2.0)) * e * (2.0 + aSeed * 3.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float twinkle = 0.7 + 0.3 * sin(uTime * (1.5 + aSeed * 2.0) + aSeed * 60.0);
    gl_PointSize = uBase * aSize * uPixelRatio * twinkle * (1.0 + f * 1.5) / -mv.z;

    vColor = aColor * (1.0 + f * 0.8);
    vAlpha = (0.18 + 0.82 * d) * (1.0 - uExit);
  }
`

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, r);
    a = pow(a, 1.8);
    gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);
  }
`

interface MarkProps {
  count: number
  leaving: boolean
  reduced: boolean
  scale: number
  offsetX: number
  offsetY: number
}

function Mark({ count, leaving, reduced, scale, offsetX, offsetY }: MarkProps) {
  const group = useRef<THREE.Group>(null)
  const geometry = useMemo(() => buildGeometry(count), [count])
  const { gl, camera, raycaster, pointer } = useThree()
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: reduced ? 1 : 0 },
          uExit: { value: 0 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uBase: { value: 12 },
          uPointer: { value: new THREE.Vector3(9, 9, 0) },
          uPointerStrength: { value: 0 },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const active = useRef(false)

  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])

  useEffect(() => {
    const el = gl.domElement.parentElement?.parentElement ?? window
    const on = () => (active.current = true)
    const off = () => (active.current = false)
    window.addEventListener("pointermove", on)
    document.addEventListener("pointerleave", off)
    el.addEventListener("pointerleave", off)
    return () => {
      window.removeEventListener("pointermove", on)
      document.removeEventListener("pointerleave", off)
      el.removeEventListener("pointerleave", off)
    }
  }, [gl])

  useFrame((state, delta) => {
    const u = material.uniforms
    const dt = Math.min(delta, 0.05)
    u.uTime.value += dt
    if (u.uProgress.value < 1) u.uProgress.value = Math.min(1, u.uProgress.value + dt / 2.6)
    if (leaving) u.uExit.value = Math.min(1, u.uExit.value + dt / 0.9)

    const g = group.current
    if (!g) return
    // tilt toward pointer
    const t = state.clock.elapsedTime
    const ry = pointer.x * 0.45 + Math.sin(t * 0.25) * 0.12
    const rx = -pointer.y * 0.25 + Math.cos(t * 0.21) * 0.05
    g.rotation.y += (ry - g.rotation.y) * 0.05
    g.rotation.x += (rx - g.rotation.x) * 0.05
    g.position.y = offsetY + Math.sin(t * 0.6) * 0.04

    // pointer in the mark's local plane
    raycaster.setFromCamera(pointer, camera)
    if (raycaster.ray.intersectPlane(plane, hit)) {
      g.worldToLocal(hit)
      u.uPointer.value.lerp(hit, 0.25)
    }
    const target = active.current && !reduced ? 1 : 0
    u.uPointerStrength.value += (target - u.uPointerStrength.value) * 0.06
  })

  return (
    <group ref={group} scale={scale} position={[offsetX, offsetY, 0]}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const rand = mulberry32(99)
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) p.set([(rand() - 0.5) * 14, (rand() - 0.5) * 9, (rand() - 0.5) * 6 - 1], i * 3)
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(p, 3))
    return g
  }, [count])
  const material = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = c.height = 64
    const x = c.getContext("2d")!
    const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, "rgba(255,255,255,1)")
    grd.addColorStop(1, "rgba(255,255,255,0)")
    x.fillStyle = grd
    x.fillRect(0, 0, 64, 64)
    return new THREE.PointsMaterial({
      size: 0.035,
      map: new THREE.CanvasTexture(c),
      color: new THREE.Color("#ffd9a8"),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])
  useEffect(() => () => { geometry.dispose(); material.map?.dispose(); material.dispose() }, [geometry, material])
  useFrame((_, d) => {
    if (!ref.current) return
    ref.current.rotation.y += d * 0.012
    ref.current.rotation.x += d * 0.004
  })
  return <points ref={ref} geometry={geometry} material={material} />
}

function Rig() {
  const { camera, pointer } = useThree()
  useFrame(() => {
    camera.position.x += (pointer.x * 0.25 - camera.position.x) * 0.03
    camera.position.y += (pointer.y * 0.15 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })
  return null
}

export interface ParticleLogoProps {
  className?: string
  leaving?: boolean
  /** "side" places the mark beside the text on wide screens */
  layout?: "side" | "center"
  isMobile?: boolean
  reduced?: boolean
  /** which side of the screen the mark sits on in "side" layout */
  markSide?: "left" | "right"
}

export function ParticleLogo({ className, leaving = false, layout = "side", isMobile = false, reduced = false, markSide = "left" }: ParticleLogoProps) {
  const side = layout === "side" && !isMobile
  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{ position: [0, 0, 4], fov: 40 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Mark
          count={isMobile ? 14000 : 32000}
          leaving={leaving}
          reduced={reduced}
          scale={side ? 2.2 : isMobile ? 0.95 : 2.1}
          offsetX={side ? (markSide === "left" ? -1.15 : 1.15) : 0}
          offsetY={isMobile ? 0.9 : 0}
        />
        <Dust count={isMobile ? 350 : 900} />
        <Rig />
      </Canvas>
    </div>
  )
}
