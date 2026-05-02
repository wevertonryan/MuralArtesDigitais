import { useMuralStore } from '@/store/muralStore'

/**
 * FAB "Criar Novo" — visível APENAS na view do Mural.
 */
export default function FAB() {
  const { view, setView } = useMuralStore()

  if (view !== 'mural') return null

  return (
    <button
      id="fab-create"
      style={styles.fab}
      onClick={() => setView('drawing')}
      title="Criar novo desenho"
      aria-label="Criar novo desenho"
    >
      <span style={styles.icon}>🎨</span>
    </button>
  )
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF8C42 0%, #7C3AED 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(255,140,66,0.45), 0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 50,
    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
    animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
  },
  icon: {
    fontSize: '28px',
    lineHeight: 1,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
  },
}
