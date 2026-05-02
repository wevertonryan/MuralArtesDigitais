import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
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

  useFrame(({ camera }) => {
    if (lightRef.current) {
      // Posicionamento estratégico: luz vem de cima e da direita da visão atual
      lightRef.current.position.set(camera.position.x + 8, camera.position.y + 12, 20)
      lightRef.current.target.position.set(camera.position.x, camera.position.y, 0)
      lightRef.current.target.updateMatrixWorld()
      
      // Força a atualização da projeção para evitar sombras cortadas em movimento
      lightRef.current.shadow.camera.updateProjectionMatrix()
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
        shadow-camera-far={60}
        shadow-camera-near={0.1}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-10, -10, 5]} intensity={0.4} color="#BAE6FD" />
    </>
  )
}
