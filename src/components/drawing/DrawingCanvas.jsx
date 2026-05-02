import { useRef, useEffect, useState, useCallback } from 'react'
import { useDrawing } from '@/hooks/useDrawing'
import { useMuralStore } from '@/store/muralStore'
import { useSession } from '@/hooks/useSession'
import Toolbar from './Toolbar'
import ColorPopover from './ColorPopover'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/utils/imageConverter'
import WelcomeModal from '@/components/ui/WelcomeModal'

export default function DrawingCanvas() {
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [showWelcome, setShowWelcome] = useState(false)

  const [startPos, setStartPos] = useState(null)
  const [currentPos, setCurrentPos] = useState(null)

  const { sessionUser } = useMuralStore()
  const { hasPseudonimo } = useSession()

  const {
    activeTool, setActiveTool,
    brushSize, setBrushSize,
    color, setColor,
    canUndo, canRedo,
    undo, redo,
    clearCanvas,
    floodFill,
    pickColor,
    saveSnapshot,
    exportWebP,
  } = useDrawing(canvasRef)

  const { setView, setPendingArtwork } = useMuralStore()

  // ===== ESCALONAMENTO RESPONSIVO =====
  // O canvas tem 1280×720px fixos; usamos CSS transform:scale para caber na tela
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const { clientWidth, clientHeight } = containerRef.current
      const scaleX = clientWidth / CANVAS_WIDTH
      const scaleY = clientHeight / CANVAS_HEIGHT
      setScale(Math.min(scaleX, scaleY) * 0.92) // 8% de margem
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // ===== CANVAS CLICK (flood fill, dropper) =====
  const handleCanvasClick = useCallback((e) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)

    if (activeTool === 'fill') {
      floodFill(x, y, color)
    } else if (activeTool === 'dropper') {
      pickColor(x, y)
    }
  }, [activeTool, color, floodFill, pickColor, scale])

  // ===== OVERLAY DRAWING (SHAPES) =====
  const handlePointerDown = useCallback((e) => {
    if (!['rect', 'circle', 'line'].includes(activeTool)) return
    if (!overlayCanvasRef.current) return
    const rect = overlayCanvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)
    setStartPos({ x, y })
    setCurrentPos({ x, y })
    overlayCanvasRef.current.setPointerCapture(e.pointerId)
  }, [activeTool, scale])

  const handlePointerMove = useCallback((e) => {
    if (!startPos) return
    if (!['rect', 'circle', 'line'].includes(activeTool)) return
    const rect = overlayCanvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / scale)
    const y = Math.floor((e.clientY - rect.top) / scale)
    setCurrentPos({ x, y })
  }, [startPos, activeTool, scale])

  const handlePointerUp = useCallback((e) => {
    if (['pen', 'eraser'].includes(activeTool)) {
      saveSnapshot()
      return
    }
    
    if (!startPos) return
    
    // Draw the shape to the main canvas
    if (['rect', 'circle', 'line'].includes(activeTool) && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      const { x: sx, y: sy } = startPos
      const { x: cx, y: cy } = currentPos
      
      ctx.beginPath()
      if (activeTool === 'rect') {
        ctx.rect(sx, sy, cx - sx, cy - sy)
        ctx.stroke()
      } else if (activeTool === 'circle') {
        const r = Math.sqrt(Math.pow(cx - sx, 2) + Math.pow(cy - sy, 2))
        ctx.arc(sx, sy, r, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (activeTool === 'line') {
        ctx.moveTo(sx, sy)
        ctx.lineTo(cx, cy)
        ctx.stroke()
      }
      saveSnapshot()
    }

    setStartPos(null)
    setCurrentPos(null)
  }, [startPos, currentPos, activeTool, color, brushSize, saveSnapshot])

  // Draw overlay preview
  useEffect(() => {
    if (!overlayCanvasRef.current) return
    const ctx = overlayCanvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    if (startPos && currentPos && ['rect', 'circle', 'line'].includes(activeTool)) {
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      const { x: sx, y: sy } = startPos
      const { x: cx, y: cy } = currentPos
      
      ctx.beginPath()
      if (activeTool === 'rect') {
        ctx.rect(sx, sy, cx - sx, cy - sy)
      } else if (activeTool === 'circle') {
        const r = Math.sqrt(Math.pow(cx - sx, 2) + Math.pow(cy - sy, 2))
        ctx.arc(sx, sy, r, 0, 2 * Math.PI)
      } else if (activeTool === 'line') {
        ctx.moveTo(sx, sy)
        ctx.lineTo(cx, cy)
      }
      ctx.stroke()
    }
  }, [startPos, currentPos, activeTool, color, brushSize])

  // ===== PUBLICAR =====
  const [titleInput, setTitleInput] = useState('')
  const [showTitleModal, setShowTitleModal] = useState(false)

  const handlePublish = () => {
    if (!hasPseudonimo) {
      setShowWelcome(true)
      return
    }
    setShowTitleModal(true)
  }

  const handleConfirmPublish = async () => {
    if (!titleInput.trim()) return
    const result = await exportWebP()
    if (!result) return

    setPendingArtwork({ ...result, titulo: titleInput.trim() })
    setShowTitleModal(false)
    setView('placement')
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => setView('mural')}>
          ← Voltar
        </button>
        <span style={styles.headerTitle}>🎨 Criar Arte</span>
        <button style={styles.publishBtn} onClick={handlePublish}>
          Publicar →
        </button>
      </div>

      <div style={styles.body} ref={containerRef}>
        {/* Canvas escalado */}
        <div style={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              ...styles.canvas,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              cursor: getCursor(activeTool),
            }}
            onClick={handleCanvasClick}
            onPointerUp={handlePointerUp} // Use the new handler for pen/eraser
          />
          <canvas
            ref={overlayCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              ...styles.canvas,
              position: 'absolute',
              top: 0,
              left: 0,
              background: 'transparent',
              pointerEvents: ['rect', 'circle', 'line'].includes(activeTool) ? 'auto' : 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              cursor: getCursor(activeTool),
              boxShadow: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>

        {/* Toolbar lateral */}
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onClear={clearCanvas}
        />

        {/* Paleta de cores */}
        <ColorPopover color={color} setColor={setColor} />
      </div>

      {/* Modal: título do desenho */}
      {showTitleModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="scale-in">
            <h2 style={styles.modalTitle}>📝 Nome do Desenho</h2>
            <input
              id="drawing-title-input"
              style={styles.modalInput}
              placeholder="Ex: Meu Peixinho Azul"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmPublish()}
              autoFocus
              maxLength={60}
            />
            <div style={styles.modalButtons}>
              <button style={styles.modalCancel} onClick={() => setShowTitleModal(false)}>
                Cancelar
              </button>
              <button
                style={{ ...styles.modalConfirm, ...(titleInput.trim() ? {} : styles.btnDisabled) }}
                onClick={handleConfirmPublish}
                disabled={!titleInput.trim()}
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: pseudônimo (se ainda não tem) */}
      {showWelcome && (
        <WelcomeModal onClose={() => setShowWelcome(false)} onConfirm={() => { setShowWelcome(false); setShowTitleModal(true) }} />
      )}
    </div>
  )
}

function getCursor(tool) {
  const map = { pen: 'crosshair', eraser: 'cell', fill: 'copy', dropper: 'zoom-in', rect: 'crosshair', circle: 'crosshair', line: 'crosshair' }
  return map[tool] ?? 'crosshair'
}

const styles = {
  root: {
    width: '100%',
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-bg)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '2px solid var(--color-border)',
    zIndex: 10,
    flexShrink: 0,
  },
  backBtn: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '2px solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  headerTitle: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '16px',
    color: 'var(--color-text)',
  },
  publishBtn: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '14px',
    color: '#fff',
    padding: '8px 18px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #FF8C42, #E06B1A)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(255,140,66,0.35)',
    transition: 'all 0.2s ease',
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  canvasWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    position: 'relative',
  },
  canvas: {
    display: 'block',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    borderRadius: '4px',
    background: '#fff',
    touchAction: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(6px)',
  },
  modal: {
    background: '#fff',
    borderRadius: '20px',
    padding: '32px 28px',
    width: '340px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalTitle: {
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '20px',
    color: 'var(--color-text)',
    textAlign: 'center',
  },
  modalInput: {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '15px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid var(--color-border)',
    outline: 'none',
    color: 'var(--color-text)',
    background: 'var(--color-bg)',
    width: '100%',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
  },
  modalCancel: {
    flex: 1,
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '700',
    fontSize: '14px',
    padding: '10px',
    borderRadius: '12px',
    border: '2px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  modalConfirm: {
    flex: 2,
    fontFamily: 'Nunito, sans-serif',
    fontWeight: '800',
    fontSize: '14px',
    padding: '10px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #FF8C42, #E06B1A)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(255,140,66,0.35)',
  },
  btnDisabled: {
    background: '#D1D5DB',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}
