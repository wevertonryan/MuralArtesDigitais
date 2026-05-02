import { useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useMuralStore } from '@/store/muralStore'
import ReactionPicker from './ReactionPicker'
import { useReactions } from '@/hooks/useReactions'

export default function ArtworkDetail() {
  const { selectedArte, setSelectedArte, setView } = useMuralStore()
  const { react, hasReagido } = useReactions()

  const springs = useSpring({
    from: { opacity: 0, scale: 0.85 },
    to: { opacity: 1, scale: 1 },
    config: { tension: 200, friction: 20 },
  })

  const handleBack = () => {
    setSelectedArte(null)
    setView('mural')
  }

  if (!selectedArte) return null

  const reacoes = selectedArte.reacoes || {}
  const totalReacoes = Object.values(reacoes).reduce((a, b) => a + b, 0)
  const topReacoes = Object.entries(reacoes).sort(([, a], [, b]) => b - a).slice(0, 5)
  const jaReagiu = hasReagido(selectedArte.id)

  return (
    <div style={styles.overlay}>
      {/* Botão voltar */}
      <button id="btn-back-detail" style={styles.backBtn} onClick={handleBack}>
        ← Voltar
      </button>

      {/* Card central animado */}
      <animated.div style={{ ...styles.container, opacity: springs.opacity, transform: springs.scale.to(s => `scale(${s})`) }}>
        {/* Nome do desenho */}
        <div style={styles.title}>{selectedArte.titulo}</div>

        {/* Imagem na moldura */}
        <div style={styles.frame}>
          <img
            src={selectedArte.url_imagem}
            alt={selectedArte.titulo}
            style={styles.image}
            draggable={false}
          />
        </div>

        {/* Linha inferior: autor + reações */}
        <div style={styles.metaRow}>
          <span style={styles.author}>@{selectedArte.autor}</span>

          <div style={styles.reactionsRow}>
            {topReacoes.map(([emoji, count]) => (
              <span key={emoji} style={styles.reactionChip}>
                {emoji} <strong>{count}</strong>
              </span>
            ))}
            {totalReacoes === 0 && (
              <span style={styles.noReactions}>Seja o primeiro a reagir!</span>
            )}
          </div>
        </div>
      </animated.div>

      {/* Botão de adicionar reação (FAB canto inferior direito) */}
      {!jaReagiu && (
        <ReactionPicker arteId={selectedArte.id} onReact={react} />
      )}
      {jaReagiu && (
        <div style={styles.alreadyReacted}>✅ Você já reagiu!</div>
      )}
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(30,27,75,0.75)',
    backdropFilter: 'blur(16px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    animation: 'fadeIn 0.25s ease forwards',
  },
  backBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '15px',
    color: '#fff',
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '20px',
    padding: '8px 18px',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: 'min(90vw, 860px)',
    width: '100%',
  },
  title: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '22px',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  frame: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,255,255,0.2)',
    width: '100%',
    aspectRatio: '16/9',
    background: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: '16px',
  },
  author: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '600',
    fontSize: '15px',
    color: 'var(--color-accent-light)',
  },
  reactionsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  reactionChip: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '14px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '4px 10px',
    backdropFilter: 'blur(4px)',
    color: '#fff',
  },
  noReactions: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  alreadyReacted: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '14px',
    color: '#fff',
    background: 'rgba(16,185,129,0.9)',
    borderRadius: '20px',
    padding: '10px 18px',
    backdropFilter: 'blur(8px)',
  },
}
