import { useRef, useState, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useTexture, Html } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAME_WORLD_WIDTH, FRAME_WORLD_HEIGHT } from '@/utils/layoutEngine'
import { isInView } from '@/utils/proximitySearch'

const FRAME_DEPTH = 0.2
const BORDER_SIZE = 0.25
const FRAME_COLOR = '#FFFFFF'

export default function MuralFrame({ arte, onClick }) {
  const meshRef = useRef()
  const { camera, size } = useThree()
  const [visible, setVisible] = useState(true)
  const texture = useTexture(arte.url_imagem)

  console.log('[MuralFrame] Renderizando arte:', arte.id, {
    pos: [arte.pos_x, arte.pos_y],
    url: arte.url_imagem,
    visible
  })

  // ===== ANIMAÇÃO DE ENTRADA (spring "pendurar") =====
  // Simplificando animação para diagnóstico
  const { scale, posY } = useSpring({
    from: { scale: 0.1, posY: 1 },
    to: { scale: 1, posY: 0 },
    config: { tension: 200, friction: 25 },
  })

  const position = [arte.pos_x, arte.pos_y, -2 + FRAME_DEPTH]

  // ===== CULLING com buffer =====
  useFrame(() => {
    const camPos = { x: camera.position.x, y: camera.position.y }
    const fovRad = THREE.MathUtils.degToRad(camera.fov || 60)
    const aspect = size.width / size.height
    const viewH = 2 * Math.tan(fovRad / 2) * camera.position.z
    const viewW = viewH * aspect

    const inView = isInView(
      { x: position[0], y: position[1] },
      camPos,
      { width: viewW + FRAME_WORLD_WIDTH, height: viewH + FRAME_WORLD_HEIGHT },
      0.5 // 50% de buffer
    )

    if (visible !== inView) setVisible(inView)
  })

  const totalW = FRAME_WORLD_WIDTH + BORDER_SIZE
  const totalH = FRAME_WORLD_HEIGHT + BORDER_SIZE

  // Soma de reações totais
  const totalReacoes = Object.values(arte.reacoes || {}).reduce((a, b) => a + b, 0)
  const topEmojis = Object.entries(arte.reacoes || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <animated.group
      position={position}
      scale={scale}
      visible={visible} // Apenas esconde, não desmonta
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >

      {/* Moldura (toon shading) */}
      <mesh castShadow>
        <boxGeometry args={[totalW, totalH, FRAME_DEPTH]} />
        <meshToonMaterial color={FRAME_COLOR} />
      </mesh>

      {/* Imagem da arte */}
      {texture && (
        <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.01]}>
          <planeGeometry args={[FRAME_WORLD_WIDTH, FRAME_WORLD_HEIGHT]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}

      {/* Metadados 2D via Html overlay */}
      <Html
        position={[-totalW / 2, totalH / 2 + 0.5, 0]}
        transform={true}
        occlude={false}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={styles.title}>{arte.titulo}</div>
      </Html>

      <Html
        position={[-totalW / 2, -totalH / 2 - 0.15, 0]}
        transform={true}
        occlude={false}
        style={{ ...styles.metaRow, width: '300px' }}
      >
        <div style={styles.author}>@{arte.autor}</div>

        {totalReacoes > 0 && (
          <div style={styles.reactions}>
            {topEmojis.map(([emoji, count]) => (
              <span key={emoji} style={styles.reactionChip}>
                {emoji} <span style={styles.reactionCount}>{count}</span>
              </span>
            ))}
          </div>
        )}
      </Html>
    </animated.group>
  )
}

const styles = {
  title: {
    position: 'relative',
    bottom: '5px',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E1B4B',
    background: 'rgba(255,255,255,0.85)',
    borderRadius: '6px',
    padding: '2px 6px',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    backdropFilter: 'blur(4px)',
  },
  metaRow: {
    pointerEvents: 'none',
    userSelect: 'none',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  author: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '10px',
    fontWeight: '600',
    color: '#7C3AED',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '6px',
    padding: '2px 6px',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(4px)',
  },
  reactions: {
    display: 'flex',
    gap: '4px',
    flexDirection: 'row-reverse',
  },
  reactionChip: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '11px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    padding: '2px 5px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    backdropFilter: 'blur(4px)',
  },
  reactionCount: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#1E1B4B',
  },
}
