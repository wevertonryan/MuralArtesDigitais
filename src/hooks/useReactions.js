import { useCallback } from 'react'
import { useMuralStore } from '@/store/muralStore'
import { addReacao } from '@/services/supabase'

export const REACOES_DISPONIVEIS = ['🔥', '🌟', '😍', '🤣', '😎', '😮', '👍', '👑', '🤯', '🏆', '🎉', '🎨', '🎬']

/**
 * Gerencia o sistema de reações.
 * Limite: 1 reação por arte por sessão (controlado via Zustand + sessionStorage).
 */
export function useReactions() {
  const { markReacao, hasReagido, reacoesDaSessao } = useMuralStore()

  const react = useCallback(async (arteId, emoji) => {
    if (hasReagido(arteId)) return { success: false, reason: 'already_reacted' }

    try {
      await addReacao(arteId, emoji)
      markReacao(arteId, emoji)
      return { success: true }
    } catch (err) {
      console.error('[useReactions] Falha ao adicionar reação:', err)
      return { success: false, reason: 'error' }
    }
  }, [hasReagido, markReacao])

  return {
    react,
    hasReagido,
    reacoesDaSessao,
    REACOES_DISPONIVEIS,
  }
}
