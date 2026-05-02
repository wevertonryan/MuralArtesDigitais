import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMuralStore } from '@/store/muralStore'
import { isPositionValid } from '@/utils/layoutEngine'
import { FRAME_WORLD_WIDTH, FRAME_WORLD_HEIGHT } from '@/utils/layoutEngine'
import { uploadArtworkToStorage, insertArtwork } from '@/services/supabase'
import { upsertArte } from '@/services/dexieService'
import { v4 as uuidv4 } from 'uuid'

export default function PlacementGhost({ artwork, existingArtes }) {
  const { camera } = useThree()
  const ghostRef = useRef()

  const { sessionUser, setView, addArte, clearPendingArtwork } = useMuralStore()

  // Posição do ghost rastreada pelo ponteiro sobre o plano Z=0
  const ghostPos = useRef(new THREE.Vector3(0, 0, 0))
  const [displayPos, setDisplayPos] = useState([0, 0, 0])
  const [isValid, setIsValid] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)

  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  // Rastreamento: o ghost fica fixo no centro da tela (0,0)
  // O usuário movimenta a câmera (arrastando) para posicionar.


  // ===== FRAME LOOP: atualiza posição e valida colisão =====
  useFrame(({ camera: cam }) => {
    // Raycast a partir do centro da tela
    raycaster.current.setFromCamera({ x: 0, y: 0 }, cam)
    const target = new THREE.Vector3()
    raycaster.current.ray.intersectPlane(plane.current, target)

    if (target) {
      ghostPos.current.copy(target)

      // Snap para grid suave (opcional — melhora UX)
      const snapped = {
        x: Math.round(target.x / 0.5) * 0.5,
        y: Math.round(target.y / 0.5) * 0.5,
      }

      const valid = isPositionValid(snapped, existingArtes)
      setIsValid(valid)
      setDisplayPos([snapped.x, snapped.y, 0.1])
    }
  })

  // ===== PUBLICAR =====
  const handleConfirm = useCallback(async () => {
    if (!isValid || isPublishing) return
    setIsPublishing(true)

    try {
      const [x, y] = displayPos
      const filename = `${uuidv4()}.webp`
      const id = filename.replace('.webp', '')

      // 1. Armazena e exibe localmente primeiro (Dexie + Store)
      const localArte = {
        id: id,
        titulo: artwork.titulo,
        autor: sessionUser?.pseudonimo ?? 'Anônimo',
        url_imagem: artwork.dataURL, // Base64 para exibir na hora
        pos_x: x,
        pos_y: y,
        largura: 1280,
        altura: 720,
        aprovado: true, // Moderação manual ou pós-publicação
        reacoes: {},
        criado_em: new Date().toISOString(),
      }

      await upsertArte(localArte)
      addArte(localArte)

      clearPendingArtwork()
      setView('mural')

      // 2. Posteriormente, envia para o Supabase (em background)
      uploadArtworkToStorage(artwork.dataURL, filename)
        .then(publicUrl => {
          const arteParaSupabase = { ...localArte, url_imagem: publicUrl }
          return insertArtwork(arteParaSupabase)
        })
        .then(savedArte => {
          // Atualiza cache local com a URL definitiva do Supabase
          upsertArte(savedArte).catch(console.warn)
          addArte(savedArte)
        })
        .catch(err => {
          console.error('[PlacementGhost] Falha no envio para o Supabase:', err)
          // Em caso de falha silenciosa (ex: IA bloqueou), a arte continua no Dexie local
          // da sessão atual, mas não vai pro backend, atendendo a regra de negócio.
        })

    } catch (err) {
      console.error('[PlacementGhost] Falha ao publicar:', err)
    } finally {
      setIsPublishing(false)
    }
  }, [isValid, isPublishing, displayPos, artwork, sessionUser, clearPendingArtwork, setView, addArte])

  const handleCancel = () => {
    clearPendingArtwork()
    setView('drawing')
  }

  const ghostColor = isValid ? '#FFFFFF' : '#EF4444'
  const ghostOpacity = isValid ? 0.55 : 0.65

  return (
    <group position={displayPos}>
      {/* Quadro ghost */}
      <mesh ref={ghostRef}>
        <planeGeometry args={[FRAME_WORLD_WIDTH, FRAME_WORLD_HEIGHT]} />
        <meshBasicMaterial
          color={ghostColor}
          transparent
          opacity={ghostOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* Borda pulsante */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(FRAME_WORLD_WIDTH, FRAME_WORLD_HEIGHT)]} />
        <lineBasicMaterial
          color={isValid ? '#FFFFFF' : '#EF4444'}
          transparent
          opacity={0.9}
          linewidth={2}
        />
      </lineSegments>

      {/* UI 2D flutuante */}
      <Html center distanceFactor={10} occlude={false}>
        <div style={styles.hud}>
          <div style={styles.instructionBadge}>
            ✋ Arraste a tela para posicionar
          </div>

          {!isValid && (
            <div style={styles.errorBadge}>
              ⚠️ Muito próximo de outra arte
            </div>
          )}

          <div style={styles.buttons}>
            <button
              style={styles.cancelBtn}
              onClick={handleCancel}
            >
              ✕ Cancelar
            </button>

            <button
              style={{
                ...styles.confirmBtn,
                ...((!isValid || isPublishing) ? styles.confirmBtnDisabled : {}),
              }}
              onClick={handleConfirm}
              disabled={!isValid || isPublishing}
            >
              {isPublishing ? '⏳ Publicando...' : '📌 Colocar Aqui'}
            </button>
          </div>
        </div>
      </Html>
    </group>
  )
}

const styles = {
  hud: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'auto',
    fontFamily: 'Nunito, sans-serif',
  },
  errorBadge: {
    background: 'rgba(239,68,68,0.95)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '13px',
    padding: '6px 14px',
    borderRadius: '20px',
    boxShadow: '0 0 0 3px rgba(239,68,68,0.3)',
    animation: 'pulseRed 1.2s infinite',
    whiteSpace: 'nowrap',
  },
  instructionBadge: {
    background: 'rgba(255,255,255,0.95)',
    color: 'var(--color-text)',
    fontWeight: '800',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    whiteSpace: 'nowrap',
    marginBottom: '8px',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.9)',
    color: '#6B7280',
    border: '2px solid rgba(0,0,0,0.12)',
    borderRadius: '20px',
    padding: '8px 18px',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
  },
  confirmBtn: {
    background: 'linear-gradient(135deg, #FF8C42, #E06B1A)',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 20px',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255,140,66,0.4)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  confirmBtnDisabled: {
    background: 'rgba(156,163,175,0.7)',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}
