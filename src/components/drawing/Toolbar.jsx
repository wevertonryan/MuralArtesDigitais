import { Paintbrush, Eraser, PaintBucket, Minus, Square, Circle, Pipette, Undo2, Redo2, Trash2 } from 'lucide-react'

const TOOLS = [
  { id: 'pen',     Icon: Paintbrush, label: 'Pincel' },
  { id: 'eraser',  Icon: Eraser, label: 'Borracha' },
  { id: 'fill',    Icon: PaintBucket, label: 'Balde' },
  { id: 'line',    Icon: Minus,  label: 'Linha' },
  { id: 'rect',    Icon: Square,  label: 'Retângulo' },
  { id: 'circle',  Icon: Circle,  label: 'Círculo' },
  { id: 'dropper', Icon: Pipette, label: 'Conta-gotas' },
]

export default function Toolbar({
  activeTool, setActiveTool,
  brushSize, setBrushSize,
  canUndo, canRedo,
  onUndo, onRedo, onClear,
  isMobile
}) {
  return (
    <div style={{ ...styles.toolbar, ...(isMobile ? styles.toolbarMobile : {}) }}>
      {/* Ferramentas */}
      <div style={{ ...styles.group, ...(isMobile ? styles.groupMobile : {}) }}>
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
      </div>

      {/* Divisor */}
      <div style={{ ...styles.divider, ...(isMobile ? styles.dividerMobile : {}) }} />

      {/* Tamanho do pincel */}
      {['pen', 'eraser', 'line', 'rect', 'circle'].includes(activeTool) && (
        <div style={{ ...styles.sizeGroup, ...(isMobile ? styles.sizeGroupMobile : {}) }}>
          <span style={styles.sizeLabel}>{brushSize}px</span>
          <input
            id="brush-size-slider"
            type="range"
            min={1}
            max={60}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={isMobile ? styles.sliderMobile : styles.slider}
          />
          {/* Preview do tamanho */}
          <div style={{
            ...styles.sizePreview,
            width: `${Math.min(brushSize, 36)}px`,
            height: `${Math.min(brushSize, 36)}px`,
            backgroundColor: 'var(--color-text)'
          }} />
        </div>
      )}

      <div style={{ ...styles.divider, ...(isMobile ? styles.dividerMobile : {}) }} />

      {/* Ações */}
      <button id="btn-undo" style={{ ...styles.actionBtn, ...(canUndo ? {} : styles.actionBtnDisabled) }}
        onClick={onUndo} disabled={!canUndo} title="Desfazer">
        <Undo2 size={20} color={canUndo ? 'var(--color-text)' : 'var(--color-text-muted)'} />
      </button>
      <button id="btn-redo" style={{ ...styles.actionBtn, ...(canRedo ? {} : styles.actionBtnDisabled) }}
        onClick={onRedo} disabled={!canRedo} title="Refazer">
        <Redo2 size={20} color={canRedo ? 'var(--color-text)' : 'var(--color-text-muted)'} />
      </button>
      <button id="btn-clear" style={{ ...styles.actionBtn }}
        onClick={onClear} title="Limpar tudo">
        <Trash2 size={20} color="#EF4444" />
      </button>
    </div>
  )
}

const styles = {
  toolbar: {
    width: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 0',
    gap: '4px',
    background: 'rgba(255,255,255,0.95)',
    borderLeft: '2px solid var(--color-border)',
    backdropFilter: 'blur(12px)',
    overflowY: 'auto',
    flexShrink: 0,
  },
  toolbarMobile: {
    width: '100%',
    height: '60px',
    flexDirection: 'row',
    padding: '0 12px',
    borderLeft: 'none',
    borderTop: '2px solid var(--color-border)',
    overflowY: 'hidden',
    overflowX: 'auto',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    alignItems: 'center',
  },
  groupMobile: {
    flexDirection: 'row',
    width: 'auto',
    height: '100%',
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
    height: '36px',
    margin: '0 4px',
  },
  sizeGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 0',
    width: '100%',
  },
  sizeGroupMobile: {
    flexDirection: 'row',
    padding: '0 4px',
    width: 'auto',
    height: '100%',
  },
  sizeLabel: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '10px',
    color: 'var(--color-text-muted)',
  },
  slider: {
    width: '40px',
    writingMode: 'vertical-lr',
    direction: 'rtl',
    cursor: 'pointer',
    height: '80px',
    accentColor: 'var(--color-primary)',
  },
  sliderMobile: {
    width: '80px',
    height: '40px',
    writingMode: 'horizontal-tb',
    direction: 'ltr',
    cursor: 'pointer',
    accentColor: 'var(--color-primary)',
  },
  sizePreview: {
    borderRadius: '50%',
    background: 'var(--color-text)',
    transition: 'all 0.15s ease',
    minWidth: '4px',
    minHeight: '4px',
  },
  actionBtn: {
    width: '40px',
    height: '40px',
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
