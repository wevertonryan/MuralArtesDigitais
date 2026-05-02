/**
 * Layout Engine — calcula a próxima posição livre no mural
 * usando expansão em espiral a partir da origem (0, 0).
 *
 * Unidades: coordenadas de cena R3F (não pixels de tela).
 * O espaçamento é baseado no tamanho do quadro na cena 3D.
 */

// Largura de um quadro no espaço 3D (unidades R3F).
// Mantido em sincronia com o MuralFrame scale.
export const FRAME_WORLD_WIDTH = 6.4   // 1280 / 200 (escala de conversão)
export const FRAME_WORLD_HEIGHT = 3.6  // 720 / 200

// Gap mínimo entre bordas de quadros adjacentes
export const FRAME_MIN_GAP = 1.2

// Passo total entre centros de quadros
const STEP_X = FRAME_WORLD_WIDTH + FRAME_MIN_GAP
const STEP_Y = FRAME_WORLD_HEIGHT + FRAME_MIN_GAP

/**
 * Gera coordenadas em espiral: centro → direita → baixo → esquerda → cima...
 * @param {number} index - posição na sequência (0-based)
 * @returns {{ x: number, y: number }}
 */
export function getSpiralCoord(index) {
  if (index === 0) return { x: 0, y: 0 }

  let x = 0, y = 0
  let step = 1, dir = 0
  const dirs = [[1, 0], [0, -1], [-1, 0], [0, 1]]
  let count = 0

  while (count < index) {
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < step; i++) {
        count++
        x += dirs[dir][0]
        y += dirs[dir][1]
        if (count === index) return { x: x * STEP_X, y: y * STEP_Y }
      }
      dir = (dir + 1) % 4
    }
    step++
  }

  return { x: 0, y: 0 }
}

/**
 * Encontra a primeira posição em espiral que não colide com nenhuma arte existente.
 * @param {Array<{pos_x, pos_y}>} existingArtes
 * @returns {{ x: number, y: number }}
 */
export function findNextFreePosition(existingArtes) {
  for (let i = 0; i < 10000; i++) {
    const candidate = getSpiralCoord(i)
    if (!hasCollision(candidate, existingArtes)) return candidate
  }
  // fallback extremo
  return getSpiralCoord(existingArtes.length + 1)
}

/**
 * Verifica se uma posição candidata colide com qualquer arte existente.
 * @param {{ x: number, y: number }} pos
 * @param {Array<{pos_x, pos_y}>} existingArtes
 * @returns {boolean}
 */
export function hasCollision(pos, existingArtes) {
  return existingArtes.some(arte => {
    const dx = Math.abs(arte.pos_x - pos.x)
    const dy = Math.abs(arte.pos_y - pos.y)
    return dx < STEP_X && dy < STEP_Y
  })
}

/**
 * Verifica se uma posição manual (escolhida pelo usuário) é válida.
 * Retorna true se estiver livre (sem colisão ou proximidade excessiva).
 * @param {{ x: number, y: number }} pos
 * @param {Array<{pos_x, pos_y}>} existingArtes
 * @returns {boolean}
 */
export function isPositionValid(pos, existingArtes) {
  return !hasCollision(pos, existingArtes)
}
