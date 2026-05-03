import { memo } from 'react'
import { Palette, Paintbrush, Eraser, PaintBucket, Minus, Square, Circle, Pipette, Undo2, Redo2, Trash2, Hand } from 'lucide-react'
import ColorPopover from './ColorPopover'

const TOOLS = [
  { id: 'pen',     Icon: Paintbrush,  label: 'Pincel' },
  { id: 'eraser',  Icon: Eraser,      label: 'Borracha' },
  { id: 'hand',    Icon: Hand,        label: 'Mover' },
  { id: 'fill',    Icon: PaintBucket, label: 'Balde' },
  { id: 'line',    Icon: Minus,       label: 'Linha' },
  { id: 'rect',    Icon: Square,      label: 'Retângulo' },
  { id: 'circle',  Icon: Circle,      label: 'Círculo' },
  { id: 'dropper', Icon: Pipette,     label: 'Conta-gotas' }
]

function Toolbar({
  activeTool, setActiveTool,
  color, setColor,
  brushSize, setBrushSize,
  canUndo, canRedo,
  onUndo, onRedo, onClear, onClearOverlay,
  isMobile
}) {
  const handleUndo = () => { onUndo(); onClearOverlay?.() }
  const handleRedo = () => { onRedo(); onClearOverlay?.() }
  const handleClear = () => { onClear(); onClearOverlay?.() }

  return (
    <div style={{ ...styles.toolbar, ...(isMobile ? styles.toolbarMobile : styles.toolbarDesktop) }}>
      <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : styles.gridDesktop) }}>
        {/* Ferramentas principais */}
        {TOOLS.map(({ id, Icon, label }) => (
          <button
            key={id}
            id={`tool-${id}`}
            title={label}
            style={{
              ...styles.toolBtn,
              ...(activeTool === id ? styles.toolBtnActive : {}),
            }}
            onClick={() => setActiveTool(id)}
          >
            <span style={styles.toolIcon}>
              <Icon size={20} strokeWidth={2.5} color={activeTool === id ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'} />
            </span>
          </button>
        ))}

        {/* Seletor de cores integrado */}
        <ColorPopover color={color} setColor={setColor} isMobile={isMobile} />

        {/* Ações de Histórico e Limpar */}
        <button id="btn-undo" style={{ ...styles.actionBtn, ...(canUndo ? {} : styles.actionBtnDisabled) }}
          onClick={handleUndo} disabled={!canUndo} title="Desfazer">
          <Undo2 size={20} color={canUndo ? 'var(--color-text)' : 'var(--color-text-muted)'} />
        </button>
        <button id="btn-redo" style={{ ...styles.actionBtn, ...(canRedo ? {} : styles.actionBtnDisabled) }}
          onClick={handleRedo} disabled={!canRedo} title="Refazer">
          <Redo2 size={20} color={canRedo ? 'var(--color-text)' : 'var(--color-text-muted)'} />
        </button>
        <button id="btn-clear" style={{ ...styles.actionBtn }}
          onClick={handleClear} title="Limpar tudo">
          <Trash2 size={20} color="#EF4444" />
        </button>
      </div>

      {/* Tamanho do pincel - Fora do grid principal para ter mais espaço */}
      {['pen', 'eraser', 'line', 'rect', 'circle'].includes(activeTool) && (
        <>
          <div style={{ ...styles.divider, ...(isMobile ? styles.dividerMobile : styles.dividerDesktop) }} />
          <div style={{ ...styles.sizeGroup, ...(isMobile ? styles.sizeGroupMobile : styles.sizeGroupDesktop) }}>
            <span style={styles.sizeLabel}>{brushSize}px</span>
            <input
              id="brush-size-slider"
              type="range"
              min={1}
              max={60}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={isMobile ? styles.sliderMobile : styles.sliderDesktop}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default memo(Toolbar)

const styles = {
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.98)',
    flexShrink: 0,
    padding: '12px',
    zIndex: 100,
  },
  toolbarDesktop: {
    height: '100%',
    flexDirection: 'column',
    borderLeft: '2px solid var(--color-border)',
    padding: '16px 8px',
  },
  toolbarMobile: {
    width: '100%',
    height: 'max-content',
    flexDirection: 'row',
    borderTop: '2px solid var(--color-border)',
    padding: '12px',
  },
  grid: {
    display: 'grid',
    gap: '6px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDesktop: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  gridMobile: {
    gridTemplateColumns: 'repeat(6, 1fr)',
  },
  toolBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    border: '2px solid transparent',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontSize: '20px',
  },
  toolBtnActive: {
    background: 'linear-gradient(135deg, rgba(255,140,66,0.15), rgba(255,140,66,0.05))',
    border: '2px solid var(--color-primary)',
    boxShadow: '0 0 0 2px rgba(255,140,66,0.15)',
  },
  toolIcon: { fontSize: '18px', lineHeight: 1 },
  divider: {
    width: '36px',
    height: '2px',
    background: 'var(--color-border)',
    borderRadius: '1px',
    margin: '4px 0',
  },
  dividerMobile: {
    width: '2px',
    height: '32px',
    background: 'var(--color-border)',
    borderRadius: '1px',
    margin: '0 4px',
  },
  dividerDesktop: {
    width: '32px',
    height: '2px',
    background: 'var(--color-border)',
    borderRadius: '1px',
    margin: '4px 0',
  },
  sizeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 0',
    width: '100%',
  },
  sizeGroupMobile: {
    flexDirection: 'column',
    padding: '0 8px',
    width: 'auto',
    gap: '8px',
  },
  sizeGroupDesktop: {
    flexDirection: 'column',
    padding: '8px 0',
    width: '100%',
    gap: '8px',
  },
  sizeLabel: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '10px',
    color: 'var(--color-text-muted)',
  },
  sliderDesktop: {
    width: '60px',
    height: '40px',
    cursor: 'pointer',
    accentColor: 'var(--color-primary)',
  },
  sliderMobile: {
    height: '70px',
    cursor: 'pointer',
    writingMode: 'vertical-lr',
    accentColor: 'var(--color-primary)',
  },
  actionBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    border: '2px solid transparent',
    background: 'transparent',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.15s ease',
  },
  actionBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
}
