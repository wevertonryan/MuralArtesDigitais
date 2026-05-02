import { useRef, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
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
      <ambientLight intensity={0.8} color="#E0F2FE" />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#FFFFFF" castShadow />
      <directionalLight position={[-5, -4, 3]} intensity={0.3} color="#FCD34D" />

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
