import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Plano de fundo infinito com cor alaranjada suave
export default function MuralBackground() {
  const meshRef = useRef()

  // Move o plano de fundo junto com a câmera (infinito visual)
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.position.x = camera.position.x
      meshRef.current.position.y = camera.position.y
    }
  })

  return (
    <>
      {/* Plano de fundo plano (Z bem atrás) */}
      <mesh ref={meshRef} position={[0, 0, -2]} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshToonMaterial 
          color="#49c945" 
          roughness={0.2}
          metalness={1}
        />
      </mesh>

      {/* Grade sutil para dar sensação de profundidade / espaço */}
      <gridHelper
        args={[500, 100, '#fff9d4', '#fff9d4']}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -1.9]}
      />
    </>
  )
}
