import { useEffect, useCallback, useRef } from 'react'
import { useMuralStore } from '@/store/muralStore'
import { getInitialArtes, listenToNewArtes } from '@/services/supabase'
import { syncArtes, upsertArte } from '@/services/dexieService'

/**
 * Inicializa e mantém sincronizado o mural com Supabase + cache Dexie.
 * Deve ser montado uma única vez no topo da aplicação.
 */
export function useMural() {
  const { setArtes, addArte, regiao } = useMuralStore()
  const unsubscribeRef = useRef(null)

  const loadInitial = useCallback(async () => {
    try {
      const artes = await getInitialArtes(regiao)
      setArtes(artes)
      // Sincroniza com cache local de forma não-bloqueante
      syncArtes(artes).catch(console.warn)
    } catch (err) {
      console.warn('[useMural] Falha ao carregar do Supabase, usando cache local:', err)
      // TODO: fallback para Dexie local
    }
  }, [regiao, setArtes])

  useEffect(() => {
    loadInitial()

    // Listener em tempo real para novas artes
    unsubscribeRef.current = listenToNewArtes((newArte) => {
      addArte(newArte)
      upsertArte(newArte).catch(console.warn)
    })

    return () => {
      unsubscribeRef.current?.()
    }
  }, [loadInitial, addArte])
}
