import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import MuralCamera from './MuralCamera'
import MuralBackground from './MuralBackground'
import MuralFrame from './MuralFrame'
import PlacementGhost from './PlacementGhost'
import { useMuralStore } from '@/store/muralStore'

export default function MuralScene() {
  const { artes, view, pendingArtwork, setSelectedArte, setView } = useMuralStore()

  const handleFrameClick = (arte) => {
    setSelectedArte(arte)
    setView('detail')
  }

  return (
    <Canvas
      frameloop="always"
      shadows
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={[1, 2]}
      style={{ background: '#BAE6FD' }}
    >
      <SceneLighting />

      <MuralBackground />
      <MuralCamera />

      {/* Teste: Cubo no centro para ver se o 3D funciona */}
      <mesh position={[0, 0, -2]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>

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
    </Canvas>
  )
}

function SceneLighting() {
  const lightRef = useRef()

  // A luz segue a câmera para manter a sombra sempre no frustum visível
  useFrame(({ camera }) => {
    if (lightRef.current) {
      lightRef.current.position.set(camera.position.x + 10, camera.position.y + 20, 15)
      lightRef.current.target.position.set(camera.position.x, camera.position.y, 0)
      lightRef.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#FFFFFF" />
      <directionalLight
        ref={lightRef}
        intensity={1.2}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={40}
        shadow-camera-near={0.1}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.001}
      />
      <pointLight position={[-10, -10, 5]} intensity={0.4} color="#BAE6FD" />
    </>
  )
}
