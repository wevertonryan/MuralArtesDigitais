import { useEffect, Suspense, lazy, useState } from 'react'
import { useMuralStore } from '@/store/muralStore'
import { useMural } from '@/hooks/useMural'
import { useAudio } from '@/hooks/useAudio'
import { useAudioEffects } from '@/hooks/useAudioEffects'
import MuralScene from '@/components/mural/MuralScene'
import FAB from '@/components/ui/FAB'
import AudioControls from '@/components/ui/AudioControls'
import PreLoginSplash from '@/components/ui/PreLoginSplash'
import CreditsPage from '@/components/ui/CreditsPage'
import { Users } from 'lucide-react'

// Lazy load das views não-críticas
const DrawingCanvas = lazy(() => import('@/components/drawing/DrawingCanvas'))
const ArtworkDetail = lazy(() => import('@/components/artwork/ArtworkDetail'))

// Detect geolocation by IP on startup
async function detectRegion(setRegiao) {
  try {
    const res = await fetch('http://ip-api.com/json?fields=city,regionName,countryCode')
    const data = await res.json()
    if (data.countryCode === 'BR') {
      const regiao = `${data.countryCode}-${data.city?.replace(/\s/g, '')}`
      setRegiao(regiao)
    }
  } catch {
    // Silently fail — filtro regional é opcional
  }
}

export default function App() {
  const view = useMuralStore(s => s.view)
  const selectedArte = useMuralStore(s => s.selectedArte)
  const setRegiao = useMuralStore(s => s.setRegiao)
  const sessionUser = useMuralStore(s => s.sessionUser)
  const [showCredits, setShowCredits] = useState(false)

  // Áudio
  const audio = useAudio()
  useAudioEffects()

  // Inicializa sync do mural
  useMural()

  // Detecta região na inicialização
  useEffect(() => {
    detectRegion(setRegiao)
  }, [setRegiao])

  return (
    <div style={{ width: '100%', height: '100dvh', position: 'relative' }}>
      {/* ===== TELA DE LOGIN OBRIGATÓRIA ===== */}
      {!sessionUser && <PreLoginSplash />}

      {/* ===== MURAL 3D (sempre montado para manter o estado da câmera) ===== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: view === 'mural' || view === 'placement' ? 'block' : 'none',
          visibility: sessionUser ? 'visible' : 'hidden',
          pointerEvents: sessionUser ? 'auto' : 'none',
          zIndex: 1
        }}
      >
        <MuralScene />
      </div>

      {/* ===== EDITOR DE DESENHO ===== */}
      {view === 'drawing' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          <Suspense fallback={<LoadingScreen message="Preparando canvas..." />}>
            <DrawingCanvas />
          </Suspense>
        </div>
      )}

      {/* ===== DETALHE DA ARTE ===== */}
      {view === 'detail' && selectedArte && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
          <Suspense fallback={<LoadingScreen message="Carregando arte..." />}>
            <ArtworkDetail />
          </Suspense>
        </div>
      )}

      {/* ===== UI GLOBAL (apenas no mural) ===== */}
      {(view === 'mural') && (
        <AudioControls
          muted={audio.muted}
          isPlaying={audio.isPlaying}
          bgmVolume={audio.bgmVolume}
          sfxVolume={audio.sfxVolume}
          showPanel={audio.showPanel}
          onToggle={audio.toggleMusic}
          onPlay={audio.playMusic}
          onBgmVolumeChange={audio.setBgmVolume}
          onSfxVolumeChange={audio.setSfxVolume}
          onPanelToggle={() => audio.setShowPanel(!audio.showPanel)}
        />
      )}
      <FAB />

      {/* ===== BOTÃO DE COLABORADORES ===== */}
      {sessionUser && view === 'mural' && (
        <button
          style={styles.creditsButton}
          onClick={() => setShowCredits(true)}
          title="Colaboradores"
          aria-label="Ver colaboradores"
        >
          <Users size={20} />
        </button>
      )}

      {/* ===== MODAL DE COLABORADORES ===== */}
      {showCredits && <CreditsPage onClose={() => setShowCredits(false)} />}

      {/* ===== LABEL DE MODO PLACEMENT ===== */}
      {view === 'placement' && (
        <div style={styles.placementBanner}>
          🖼️ Arraste para escolher onde pendurar sua obra
        </div>
      )}
    </div>
  )
}

function LoadingScreen({ message }) {
  return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <span style={styles.loadingText}>{message}</span>
    </div>
  )
}

const styles = {
  loading: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'var(--color-bg)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--color-border)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '16px',
    color: 'var(--color-text-muted)',
  },
  placementBanner: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '14px',
    color: '#fff',
    background: 'rgba(30,27,75,0.85)',
    borderRadius: '20px',
    padding: '10px 20px',
    backdropFilter: 'blur(10px)',
    zIndex: 30,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.4s ease forwards',
  },
  creditsButton: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text)',
    boxShadow: 'var(--shadow-md)',
    zIndex: 50,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
}
