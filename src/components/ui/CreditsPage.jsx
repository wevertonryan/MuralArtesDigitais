import { Users, X } from 'lucide-react'

const COLLABORATORS = [
  {
    name: 'Weveton Ryan',
    role: 'Product Owner',
    link: 'https://github.com/wevertonryan'
  },
  {
    name: 'Anti Gravity',
    role: 'Fullstack',
    link: 'https://github.com'
  }
]

export default function CreditsPage({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        
        <div style={styles.header}>
          <Users size={40} color="var(--color-primary)" />
          <h2 style={styles.title}>Desenvolvedores</h2>
        </div>
        
        <div style={styles.list}>
          {COLLABORATORS.map((person, index) => (
            <a
              key={index}
              href={person.link}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.card}
            >
              <div style={styles.avatar}>
                {person.name.charAt(0)}
              </div>
              <div style={styles.info}>
                <span style={styles.name}>{person.name}</span>
                <span style={styles.role}>{person.role}</span>
              </div>
            </a>
          ))}
        </div>
        
        <p style={styles.footer}>
          Hospital Amaral Carvalho (HAC) - 2026
        </p>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--color-surface)',
    padding: 'var(--space-6)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    maxWidth: '420px',
    width: '90%',
    position: 'relative',
    animation: 'bounceIn 0.4s var(--transition-spring) forwards',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  title: {
    color: 'var(--color-text)',
    fontSize: 'var(--font-size-xl)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginBottom: 'var(--space-6)',
    fontSize: 'var(--font-size-sm)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3)',
    background: 'var(--color-bg)',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF8C42 0%, #7C3AED 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    color: 'var(--color-text)',
    fontWeight: '600',
    fontSize: 'var(--font-size-md)',
  },
  role: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-sm)',
  },
  footer: {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-xs)',
    marginTop: 'var(--space-6)',
  },
}