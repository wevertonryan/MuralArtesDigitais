import React, { useMemo } from 'react'
import { useTexture, Html } from '@react-three/drei'
import { FRAME_WORLD_WIDTH, FRAME_WORLD_HEIGHT } from '@/utils/layoutEngine'

const FRAME_DEPTH = 0.2
const BORDER_SIZE = 0.25
const FRAME_COLOR = 'rgba(255, 255, 255, 1)'

export default React.memo(function MuralFrame({ arte, onClick }) {
  const texture = useTexture(arte.url_imagem)

  const position = useMemo(() => 
    [arte.pos_x, arte.pos_y, -1.9 + FRAME_DEPTH], 
    [arte.pos_x, arte.pos_y]
  )

  const totalW = FRAME_WORLD_WIDTH + BORDER_SIZE
  const totalH = FRAME_WORLD_HEIGHT + BORDER_SIZE

  const { totalReacoes, topEmojis } = useMemo(() => {
    const reacoes = arte.reacoes || {}
    const total = Object.values(reacoes).reduce((a, b) => a + b, 0)
    const top = Object.entries(reacoes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    return { totalReacoes: total, topEmojis: top }
  }, [arte.reacoes])

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >

      {/* Moldura */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[totalW, totalH, FRAME_DEPTH]} />
        <meshToonMaterial
          color={FRAME_COLOR} 
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>
 
      {/* Imagem da arte */}
      {texture && (
        <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.01]}>
          <planeGeometry args={[FRAME_WORLD_WIDTH, FRAME_WORLD_HEIGHT]} />
          <meshLambertMaterial map={texture} metalness={1} roughness={0.5} />
        </mesh>
      )}

      {/* Metadados 2D via Html overlay */}
      <Html
        position={[0, totalH / 2 + 0.5, 0]}
        transform={true}
        occlude={true}
        zIndexRange={[10, 20]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={styles.title}>{arte.titulo}</div>
      </Html>

      <Html
        position={[0, -totalH / 2 - 0.5, 0]}
        transform={true}
        occlude={true}
        zIndexRange={[10, 20]}
        style={{ ...styles.metaRow, width: '275px' }}
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
    </group>
  )
})

const styles = {
  title: {
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
