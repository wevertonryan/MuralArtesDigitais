import { useState } from 'react'
import { REACOES_DISPONIVEIS } from '@/hooks/useReactions'
import { audioService } from '@/services/audioService'

export default function ReactionPicker({ arteId, onReact }) {
  const [isOpen, setIsOpen] = useState(false)
  const [reacting, setReacting] = useState(false)

  const handleReact = async (emoji) => {
    if (reacting) return
    setReacting(true)
    audioService.playSfx('reaction')
    await onReact(arteId, emoji)
    setIsOpen(false)
    setReacting(false)
  }

  return (
    <>
      {/* Picker expandido (estilo WhatsApp) */}
      {isOpen && (
        <div style={styles.pickerOverlay} onClick={() => setIsOpen(false)}>
          <div style={styles.picker} className="slide-up" onClick={(e) => e.stopPropagation()}>
            <div style={styles.pickerTitle}>Escolha uma reação</div>
            <div style={styles.emojiGrid}>
              {REACOES_DISPONIVEIS.map((emoji) => (
                <button
                  key={emoji}
                  id={`reaction-${emoji}`}
                  style={styles.emojiBtn}
                  onClick={() => handleReact(emoji)}
                  disabled={reacting}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAB de reação */}
      <button
        id="btn-add-reaction"
        style={styles.fab}
        onClick={() => setIsOpen(!isOpen)}
        title="Adicionar Reação"
      >
        <span style={styles.fabEmoji}>😊</span>
        <span style={styles.fabPlus}>+</span>
      </button>
    </>
  )
}

const styles = {
  pickerOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
  },
  picker: {
    position: 'fixed',
    bottom: '90px',
    right: '24px',
    background: 'rgba(30,27,75,0.92)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    minWidth: '300px',
  },
  pickerTitle: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '12px',
    textAlign: 'center',
  },
  emojiGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },
  emojiBtn: {
    fontSize: '28px',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    lineHeight: 1,
  },
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF8C42, #E06B1A)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(255,140,66,0.5)',
    zIndex: 201,
    transition: 'transform 0.2s var(--transition-spring)',
  },
  fabEmoji: {
    fontSize: '22px',
    lineHeight: 1,
  },
  fabPlus: {
    fontSize: '14px',
    fontWeight: '900',
    color: '#fff',
    position: 'absolute',
    bottom: '6px',
    right: '4px',
    lineHeight: 1,
  },
}
