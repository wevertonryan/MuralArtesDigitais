import { useState } from 'react'
import { useSession } from '@/hooks/useSession'

export default function WelcomeModal({ onClose, onConfirm }) {
  const [name, setName] = useState('')
  const { initSession } = useSession()

  const handleSubmit = () => {
    if (!name.trim()) return
    initSession(name.trim())
    onConfirm?.()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="scale-in">
        <div style={styles.emoji}>🎨</div>
        <h1 style={styles.title}>Olá, artista!</h1>
        <p style={styles.subtitle}>
          Escolha um apelido para assinar suas obras no mural.
        </p>

        <input
          id="pseudonimo-input"
          style={styles.input}
          placeholder="Ex: PintorEstrela, ArtistaMágico..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
          maxLength={30}
        />

        <button
          id="btn-confirm-pseudonimo"
          style={{ ...styles.btn, ...(name.trim() ? {} : styles.btnDisabled) }}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          Entrar no Mural ✨
        </button>

        {onClose && (
          <button style={styles.skip} onClick={onClose}>
            Só explorar por enquanto →
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(30,27,75,0.6)',
    backdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
    animation: 'fadeIn 0.3s ease forwards',
  },
  modal: {
    background: '#FFFFFF',
    borderRadius: '28px',
    padding: '40px 32px',
    width: 'min(90vw, 380px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
    textAlign: 'center',
  },
  emoji: { fontSize: '48px', lineHeight: 1 },
  title: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '900',
    fontSize: '26px',
    color: 'var(--color-text)',
    margin: 0,
  },
  subtitle: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '600',
    fontSize: '15px',
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
    margin: 0,
  },
  input: {
    width: '100%',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '16px',
    fontWeight: '700',
    padding: '14px 18px',
    borderRadius: '14px',
    border: '2px solid var(--color-border)',
    outline: 'none',
    color: 'var(--color-text)',
    background: 'var(--color-bg)',
    textAlign: 'center',
    transition: 'border-color 0.2s ease',
  },
  btn: {
    width: '100%',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '16px',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #FF8C42, #7C3AED)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,140,66,0.4)',
    transition: 'opacity 0.2s ease',
  },
  btnDisabled: {
    background: '#D1D5DB',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  skip: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '600',
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}
