"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, MeshTransmissionMaterial, Sparkles } from "@react-three/drei"
import { useRef, useMemo, Suspense } from "react"
import * as THREE from "three"

/* ============================================================================
   BALAND 3D Scene — floating diamond crystals in brand colors.
   Inspired by bixa.ai's void + ember aesthetic and hekpixle's 3D hero canvas.
   ============================================================================ */

interface CrystalProps {
  position: [number, number, number]
  color: string
  scale?: number
  rotationSpeed?: number
}

function DiamondCrystal({ position, color, scale = 1, rotationSpeed = 0.3 }: CrystalProps) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * rotationSpeed
    ref.current.rotation.x += delta * rotationSpeed * 0.4
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.15
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.4}
          roughness={0.1}
          transmission={0.6}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  )
}

function SmallCrystal({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.5
    ref.current.rotation.z = state.clock.elapsedTime * 0.3
  })
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={ref} position={position} scale={0.3}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  )
}

function CenterPiece() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.15
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
  })
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={ref} scale={1.4}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          thickness={0.8}
          roughness={0.05}
          transmission={1}
          ior={1.7}
          chromaticAberration={0.05}
          backside
          color="#13A48B"
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
        />
      </mesh>
    </Float>
  )
}

interface SceneProps {
  className?: string
  variant?: "full" | "ambient" | "minimal"
}

export function Scene3D({ className = "", variant = "full" }: SceneProps) {
  const crystals = useMemo(() => {
    const orange = "#EF8614"
    const teal = "#13A48B"
    const navy = "#094588"
    const main: CrystalProps[] = [
      { position: [-3.2, 0.6, -1], color: orange, scale: 0.6, rotationSpeed: 0.25 },
      { position: [3.0, -0.8, -0.5], color: teal, scale: 0.7, rotationSpeed: 0.3 },
      { position: [-2.0, -1.6, 0.5], color: navy, scale: 0.45, rotationSpeed: 0.4 },
      { position: [2.4, 1.4, -1.5], color: orange, scale: 0.5, rotationSpeed: 0.2 },
      { position: [0, 2.2, -2], color: teal, scale: 0.4, rotationSpeed: 0.35 },
      { position: [-1.4, 1.8, 0.8], color: navy, scale: 0.35, rotationSpeed: 0.45 },
    ]
    const smalls = Array.from({ length: 12 }).map((_, i) => ({
      position: [
        Math.sin(i * 1.3) * 4,
        Math.cos(i * 0.9) * 2.5,
        Math.sin(i * 0.7) * 2 - 1,
      ] as [number, number, number],
      color: [orange, teal, navy][i % 3],
    }))
    return { main, smalls }
  }, [])

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFFFFF" />
          <pointLight position={[-5, -3, 2]} intensity={1.5} color="#EF8614" />
          <pointLight position={[5, 3, -2]} intensity={1.2} color="#13A48B" />
          <pointLight position={[0, 5, 5]} intensity={0.8} color="#094588" />

          {variant !== "minimal" && <CenterPiece />}

          {crystals.main.map((c, i) => (
            <DiamondCrystal key={`m-${i}`} {...c} />
          ))}

          {variant === "full" && crystals.smalls.map((s, i) => (
            <SmallCrystal key={`s-${i}`} {...s} />
          ))}

          <Sparkles
            count={variant === "full" ? 60 : 30}
            scale={[10, 6, 6]}
            size={2}
            speed={0.3}
            color="#EF8614"
            opacity={0.6}
          />
          <Sparkles
            count={variant === "full" ? 40 : 20}
            scale={[8, 5, 5]}
            size={1.5}
            speed={0.4}
            color="#13A48B"
            opacity={0.5}
          />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

/* ============================================================================
   Lightweight ambient crystal — single octahedron, no environment maps.
   Use for small inline decorations (cards, badges).
   ============================================================================ */
export function AmbientCrystal({ size = 1, color = "#EF8614" }: { size?: number; color?: string }) {
  return (
    <div className="relative w-full h-full" aria-hidden>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 3, 3]} intensity={1.5} color={color} />
          <pointLight position={[-3, -3, 3]} intensity={1} color="#FFFFFF" />
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh scale={size}>
              <octahedronGeometry args={[1, 0]} />
              <meshPhysicalMaterial
                color={color}
                metalness={0.5}
                roughness={0.15}
                transmission={0.7}
                thickness={0.5}
                ior={1.5}
                clearcoat={1}
                emissive={color}
                emissiveIntensity={0.2}
              />
            </mesh>
          </Float>
        </Suspense>
      </Canvas>
    </div>
  )
}
