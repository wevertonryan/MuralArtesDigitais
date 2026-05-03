import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Environment, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Vignette, Bloom } from '@react-three/postprocessing'
import MuralCamera from './MuralCamera'
import MuralBackground from './MuralBackground'
import MuralFrame from './MuralFrame'
import PlacementGhost from './PlacementGhost'
import { useMuralStore } from '@/store/muralStore'

export default function MuralScene() {
  const artes = useMuralStore(s => s.artes)
  const view = useMuralStore(s => s.view)
  const pendingArtwork = useMuralStore(s => s.pendingArtwork)
  const setSelectedArte = useMuralStore(s => s.setSelectedArte)
  const setView = useMuralStore(s => s.setView)

  const handleFrameClick = (arte) => {
    setSelectedArte(arte)
    setView('detail')
  }

  return (
    <Canvas
      frameloop={(view === 'mural' || view === 'placement') ? "always" : "never"}
      shadows
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        outputColorSpace: 'srgb',
        toneMapping: 'acesfilmic',
        toneMappingExposure: 1.0
      }}
      style={{ background: '#BAE6FD' }}
    >
      <AdaptiveEvents />
      <PerformanceMonitor />
      <SceneLighting />

      <MuralBackground />
      <ShadowPlane />
      <MuralCamera />

      {/* Quadros das artes */}
      <Suspense fallback={
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      }>
        {artes.map((arte) => (
          <MuralFrame
            key={arte.id}
            arte={arte}
            onClick={() => handleFrameClick(arte)}
          />
        ))}
      </Suspense>

      {/* Ghost de posicionamento (quando usuário escolhe onde colocar) */}
      {view === 'placement' && pendingArtwork && (
        <PlacementGhost artwork={pendingArtwork} existingArtes={artes} />
      )}

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.4}
          intensity={0.15}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}

function ShadowPlane() {
  return (
    <mesh position={[0, 0, -3]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial opacity={0.3} color="#000000" />
    </mesh>
  )
}

function SceneLighting() {
  return (
    <>
      <Environment preset="apartment" background={false} />
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.0}
        color="#fff8e7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-near={0.1}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0001}
      />
    </>
  )
}
