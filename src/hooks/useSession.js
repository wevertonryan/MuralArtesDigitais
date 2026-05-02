import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMuralStore } from '@/store/muralStore'

/**
 * Gerencia a sessão temporária do usuário (pseudônimo + ID de sessão).
 * O ID de sessão é gerado uma única vez por aba e armazenado em sessionStorage.
 * Destruído automaticamente ao fechar a aba.
 */
export function useSession() {
  const { sessionUser, setSessionUser } = useMuralStore()

  const getOrCreateSessionId = useCallback(() => {
    let sid = sessionStorage.getItem('mural_session_id')
    if (!sid) {
      sid = uuidv4()
      sessionStorage.setItem('mural_session_id', sid)
    }
    return sid
  }, [])

  const initSession = useCallback((pseudonimo) => {
    const sessionId = getOrCreateSessionId()
    const user = { pseudonimo: pseudonimo.trim(), sessionId }
    setSessionUser(user)
    // NÃO persiste em localStorage — sessão termina com a aba
    return user
  }, [getOrCreateSessionId, setSessionUser])

  const hasPseudonimo = !!sessionUser?.pseudonimo

  return {
    sessionUser,
    sessionId: getOrCreateSessionId(),
    hasPseudonimo,
    initSession,
  }
}
