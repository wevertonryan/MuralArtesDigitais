// Dimensões fixas do canvas de desenho
export const CANVAS_WIDTH = 1280
export const CANVAS_HEIGHT = 720

// Aspect ratio resultante (16:9)
export const CANVAS_ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT

/**
 * Converte o conteúdo de um HTMLCanvasElement para um Blob WebP.
 * O canvas de entrada DEVE ter exatamente 1280×720px.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} quality - 0 a 1 (padrão: 0.85)
 * @returns {Promise<Blob>}
 */
export function canvasToWebP(canvas, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
      console.warn(`[imageConverter] Canvas fora das dimensões esperadas: ${canvas.width}×${canvas.height}`)
    }
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Falha ao converter canvas para WebP'))
        resolve(blob)
      },
      'image/webp',
      quality
    )
  })
}

/**
 * Converte um Blob para uma Data URL (para preview e auto-save).
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Converte uma Data URL para Blob.
 * @param {string} dataURL
 * @returns {Blob}
 */
export function dataURLToBlob(dataURL) {
  const [header, data] = dataURL.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(data)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return new Blob([array], { type: mime })
}
