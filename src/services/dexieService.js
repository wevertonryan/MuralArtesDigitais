import Dexie from 'dexie'

// =============================================
// Schema do banco local (IndexedDB via Dexie)
// =============================================
export const localDB = new Dexie('MuralArtesDigitais')

localDB.version(1).stores({
  // índices para busca eficiente
  artes: 'id, regiao, pos_x, pos_y, criado_em',
  // rascunho do canvas em progresso (no máximo 1 por sessão)
  rascunho: 'id, salvo_em',
})

// =============================================
// Operações de Arte
// =============================================

/** Sincroniza um lote de artes vindas do Supabase para o cache local */
export async function syncArtes(artes) {
  await localDB.artes.bulkPut(artes)
}

/** Adiciona ou atualiza uma única arte */
export async function upsertArte(arte) {
  await localDB.artes.put(arte)
}

/**
 * Busca artes dentro de um raio XY da câmera.
 * Usa comparação linear sobre índice (eficiente para <10k registros).
 */
export async function getArtesByProximity(camX, camY, radius = 2000) {
  return localDB.artes
    .filter(arte => {
      const dx = arte.pos_x - camX
      const dy = arte.pos_y - camY
      return Math.abs(dx) <= radius && Math.abs(dy) <= radius
    })
    .toArray()
}

/** Retorna TODAS as coordenadas ocupadas (para cálculo anti-overlap) */
export async function getAllCoordenadas() {
  return localDB.artes.toCollection().keys()
}

/** Retorna todas as artes como array (para posicionamento) */
export async function getAllArtes() {
  return localDB.artes.toArray()
}

// =============================================
// Rascunho (auto-save do canvas em progresso)
// =============================================

export async function saveRascunho(dataURL) {
  await localDB.rascunho.put({ id: 'current', dataURL, salvo_em: Date.now() })
}

export async function getRascunho() {
  return localDB.rascunho.get('current')
}

export async function clearRascunho() {
  await localDB.rascunho.delete('current')
}
