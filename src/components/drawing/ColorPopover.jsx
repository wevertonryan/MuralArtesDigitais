import { useState } from 'react'
import { Palette, X } from 'lucide-react'

const PALETTE = [
  '#000000', '#1E293B', '#64748B', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#FDE68A',
  '#10B981', '#A7F3D0',
  '#3B82F6', '#BAE6FD',
  '#EC4899', '#F9A8D4',
  '#8B5CF6', '#C4B5FD',
  '#D97706', '#FCD34D'
]

export default function ColorPopover({ color, setColor, isMobile }) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(color)

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={isMobile ? styles.popoverContainer : {}}>
          <div style={{ ...styles.popover, ...(isMobile ? styles.popoverMobile : styles.popoverDesktop) }} className="scale-in">
            <div style={styles.header}>
              <span style={styles.title}>Cores</span>
              <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={styles.swatchGrid}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  title={c}
                  style={{
                    ...styles.swatch,
                    background: c,
                    ...(c === color ? styles.swatchActive : {}),
                    ...(c === '#FFFFFF' ? { border: '1px solid #CBD5E1' } : {}),
                  }}
                  onClick={() => { setColor(c); setCustomColor(c) }}
                />
              ))}

              <label style={styles.customLabel} title="Cor personalizada">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value) }}
                  style={styles.colorInput}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      <button
        style={{
          ...styles.toggleBtn,
          background: color,
          border: color === '#FFFFFF' ? '2px solid var(--color-border)' : '2px solid transparent'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Escolher Cor"
      >
        <Palette size={20} color={isLight(color) ? '#1E293B' : '#FFFFFF'} />
      </button>
    </div>
  )
}

function isLight(color) {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) || 0
  const g = parseInt(hex.substr(2, 2), 16) || 0
  const b = parseInt(hex.substr(4, 2), 16) || 0
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return brightness > 155
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  popoverContainer: {
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(8px)',

  },
  popover: {
    position: 'absolute',
    background: 'rgba(255,255,255,0.98)',
    backdropFilter: 'blur(12px)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    boxShadow: 'var(--shadow-xl)',
    border: '2px solid var(--color-border)',
    width: '210px',
    zIndex: 100,
  },
  popoverDesktop: {
    bottom: '0',
    right: 'calc(100% + 12px)',
  },
  popoverMobile: {
    width: '100%',
    maxWidth: '300px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '14px',
    color: 'var(--color-text)',
  },
  closeBtn: {
    padding: '4px',
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    display: 'flex',
    background: 'transparent',
    border: 'none',
  },
  swatchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  swatch: {
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'transform 0.15s ease',
  },
  swatchActive: {
    border: '2px solid var(--color-text)',
    transform: 'scale(1.1)',
  },
  customLabel: {
    position: 'relative',
    cursor: 'pointer',
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '8px',
    background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.5)',
  },
  colorInput: {
    opacity: 0,
    width: '100%',
    height: '100%',
    position: 'absolute',
    inset: 0,
    cursor: 'pointer',
  }
}
