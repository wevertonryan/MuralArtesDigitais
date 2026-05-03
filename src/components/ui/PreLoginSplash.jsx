import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMuralStore } from '@/store/muralStore'
import { audioService } from '@/services/audioService'

export default function PreLoginSplash() {
  const { setSessionUser } = useMuralStore()
  const [pseudonimo, setPseudonimo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pseudonimo.trim().length > 0) {
      audioService.playBgm()
      setSessionUser({
        pseudonimo: pseudonimo.trim(),
        sessionId: uuidv4()
      })
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎨 Mural Mágico</h1>
        <p style={styles.subtitle}>Como devemos chamar você, artista?</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={pseudonimo}
            onChange={(e) => setPseudonimo(e.target.value)}
            placeholder="Seu nome artístico..."
            style={styles.input}
            maxLength={20}
          />
          <button 
            type="submit" 
            style={{...styles.button, opacity: pseudonimo.trim() ? 1 : 0.5}}
            disabled={!pseudonimo.trim()}
          >
            Entrar no Mural ✨
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    background: 'var(--color-surface)',
    padding: 'var(--space-8)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    textAlign: 'center',
    animation: 'bounceIn 0.5s var(--transition-spring) forwards',
    maxWidth: '400px',
    width: '90%',
  },
  title: {
    color: 'var(--color-primary-dark)',
    fontSize: 'var(--font-size-2xl)',
    marginBottom: 'var(--space-2)',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-6)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  input: {
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    border: '2px solid var(--color-border)',
    fontSize: 'var(--font-size-lg)',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  },
  button: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'bold',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
    boxShadow: 'var(--shadow-glow-primary)',
  }
}
