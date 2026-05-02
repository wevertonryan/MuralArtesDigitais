import { useEffect, useRef, useCallback, useState } from 'react'
import Atrament from 'atrament'
import { CANVAS_WIDTH, CANVAS_HEIGHT, canvasToWebP, blobToDataURL, dataURLToBlob } from '@/utils/imageConverter'
import { saveRascunho, getRascunho, clearRascunho } from '@/services/dexieService'

const MAX_HISTORY = 50
const AUTOSAVE_INTERVAL_MS = 30_000

export function useDrawing(canvasRef) {
  const atramentRef = useRef(null)
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const autosaveTimerRef = useRef(null)

  const [activeTool, setActiveTool] = useState('pen')
  const [brushSize, setBrushSize] = useState(6)
  const [color, setColor] = useState('#1E1B4B')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // ===== INICIALIZAÇÃO =====
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    const atrament = new Atrament(canvas, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      color: color,
      weight: brushSize,
      smoothing: 0.85,
      adaptiveStroke: true,
    })

    atramentRef.current = atrament

    // Preenche fundo branco
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Salva estado inicial no histórico
    saveSnapshot()

    // Restaura rascunho salvo
    getRascunho().then((rascunho) => {
      if (rascunho?.dataURL) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          saveSnapshot()
        }
        img.src = rascunho.dataURL
      }
    })

    // Auto-save periódico
    autosaveTimerRef.current = setInterval(autoSave, AUTOSAVE_INTERVAL_MS)

    return () => {
      clearInterval(autosaveTimerRef.current)
      atrament.destroy?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  // ===== SYNC DE FERRAMENTA / COR / TAMANHO =====
  useEffect(() => {
    const a = atramentRef.current
    if (!a) return
    a.color = color
    a.weight = brushSize
    a.mode = activeTool === 'eraser' ? 'erase' : 'draw'
  }, [activeTool, color, brushSize])

  // ===== HISTÓRICO =====
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL()
    const idx = historyIndexRef.current

    // Remove redo history ao fazer nova ação
    historyRef.current = historyRef.current.slice(0, idx + 1)
    historyRef.current.push(dataURL)

    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    } else {
      historyIndexRef.current++
    }

    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(false)
  }, [canvasRef])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    restoreSnapshot(historyRef.current[historyIndexRef.current])
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(true)
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    restoreSnapshot(historyRef.current[historyIndexRef.current])
    setCanUndo(true)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }, [])

  const restoreSnapshot = (dataURL) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.drawImage(img, 0, 0)
    }
    img.src = dataURL
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    saveSnapshot()
  }, [canvasRef, saveSnapshot])

  // ===== FLOOD FILL =====
  const floodFill = useCallback((x, y, fillColor) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data

    const toIdx = (px, py) => (py * canvas.width + px) * 4
    const target = data.slice(toIdx(x, y), toIdx(x, y) + 4)
    const fill = hexToRGBA(fillColor)

    if (colorsMatch(target, fill)) return

    const stack = [[x, y]]
    while (stack.length) {
      const [cx, cy] = stack.pop()
      const idx = toIdx(cx, cy)
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue
      if (!colorsMatch(data.slice(idx, idx + 4), target)) continue

      data[idx] = fill[0]; data[idx+1] = fill[1]; data[idx+2] = fill[2]; data[idx+3] = fill[3]
      stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1])
    }

    ctx.putImageData(imgData, 0, 0)
    saveSnapshot()
  }, [canvasRef, saveSnapshot])

  // ===== COLOR DROPPER =====
  const pickColor = useCallback((x, y) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
    setColor(hex)
    setActiveTool('pen')
  }, [canvasRef])

  // ===== AUTO-SAVE =====
  const autoSave = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL()
    await saveRascunho(dataURL)
  }, [canvasRef])

  // ===== EXPORT =====
  const exportWebP = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const blob = await canvasToWebP(canvas)
    const dataURL = await blobToDataURL(blob)
    return { blob, dataURL }
  }, [canvasRef])

  const clearDraft = useCallback(() => clearRascunho(), [])

  return {
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
    clearDraft,
  }
}

// ===== HELPERS =====
function hexToRGBA(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b, 255]
}

function colorsMatch(a, b, tolerance = 30) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance
  )
}
