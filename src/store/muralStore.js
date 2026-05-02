import { create } from 'zustand'

/**
 * Estado global da aplicação.
 * Views: 'mural' | 'drawing' | 'placement' | 'detail'
 */
export const useMuralStore = create((set, get) => ({
  // ===== VIEW =====
  view: 'mural',
  setView: (view) => set({ view }),

  // ===== SESSÃO =====
  sessionUser: null, // { pseudonimo: string, sessionId: string }
  setSessionUser: (user) => set({ sessionUser: user }),

  // ===== REGIÃO =====
  regiao: null,
  setRegiao: (regiao) => set({ regiao }),

  // ===== ARTES DO MURAL =====
  artes: [],
  addArte: (arte) => set((s) => ({
    artes: s.artes.find(a => a.id === arte.id) ? s.artes : [arte, ...s.artes],
  })),
  setArtes: (artes) => set({ artes }),

  // ===== ARTE SELECIONADA (detalhe) =====
  selectedArte: null,
  setSelectedArte: (arte) => set({ selectedArte: arte }),

  // ===== CÂMERA =====
  cameraTarget: [0, 0, 10], // [x, y, z]
  setCameraTarget: (target) => set({ cameraTarget: target }),

  // ===== MODO DE PUBLICAÇÃO =====
  pendingArtwork: null, // { dataURL, blob } — arte pronta para ser posicionada
  setPendingArtwork: (artwork) => set({ pendingArtwork: artwork }),
  clearPendingArtwork: () => set({ pendingArtwork: null }),

  // ===== REAÇÕES (cache local de quem reagiu) =====
  // Map de arteId → emoji usado nesta sessão
  reacoesDaSessao: {},
  markReacao: (arteId, emoji) => set((s) => ({
    reacoesDaSessao: { ...s.reacoesDaSessao, [arteId]: emoji },
  })),
  hasReagido: (arteId) => !!get().reacoesDaSessao[arteId],
}))
