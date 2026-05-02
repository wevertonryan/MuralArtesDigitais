import { getArtesByProximity } from '@/services/dexieService'

/**
 * Busca artes visíveis com base na posição da câmera.
 * Usa o banco local (Dexie) para evitar requisições constantes à rede.
 *
 * @param {number} camX - posição X da câmera no espaço 3D
 * @param {number} camY - posição Y da câmera no espaço 3D
 * @param {number} viewRadius - raio de carregamento (unidades R3F)
 * @returns {Promise<Array>}
 */
export async function getVisibleArtes(camX, camY, viewRadius = 30) {
  return getArtesByProximity(camX, camY, viewRadius)
}

/**
 * Verifica se uma arte está dentro do frustum visível da câmera,
 * com um buffer extra para evitar pop-in/pop-out.
 *
 * @param {{ x: number, y: number }} arteCoord
 * @param {{ x: number, y: number }} camPos
 * @param {{ width: number, height: number }} viewSize - tamanho visível em unidades R3F
 * @param {number} bufferFactor - fator de buffer além da área visível (padrão: 0.3 = 30%)
 * @returns {boolean}
 */
export function isInView(arteCoord, camPos, viewSize, bufferFactor = 0.3) {
  const halfW = (viewSize.width / 2) * (1 + bufferFactor)
  const halfH = (viewSize.height / 2) * (1 + bufferFactor)

  return (
    Math.abs(arteCoord.x - camPos.x) <= halfW &&
    Math.abs(arteCoord.y - camPos.y) <= halfH
  )
}
