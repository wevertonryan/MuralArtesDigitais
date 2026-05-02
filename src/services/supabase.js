import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Credenciais do Supabase não encontradas no .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

/**
 * Busca artes (já aprovadas ou auto-aprovadas se não houver moderação)
 */
export async function getInitialArtes(regiao = null) {
  const { data, error } = await supabase
    .from('mural_artes')
    .select('*')
    // .eq('aprovado', true) // Descomente caso use moderação
    .order('criado_em', { ascending: false })
    .limit(200)
  
  if (error) throw error
  return data || []
}

/**
 * Escuta novas artes inseridas no banco
 */
export function listenToNewArtes(onAdd) {
  const channel = supabase
    .channel('public:mural_artes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mural_artes' }, payload => {
      onAdd(payload.new)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Upload de arte para o Supabase Storage
 */
export async function uploadArtworkToStorage(dataURL, filename) {
  // Converte dataURL para Blob
  const res = await fetch(dataURL)
  const blob = await res.blob()

  const { data, error } = await supabase.storage
    .from('artworks')
    .upload(filename, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false
    })
    
  if (error) throw error
  
  const { data: publicData } = supabase.storage
    .from('artworks')
    .getPublicUrl(filename)
    
  return publicData.publicUrl
}

/**
 * Insere metadados da arte no banco de dados
 */
export async function insertArtwork(artworkData) {
  const { data, error } = await supabase
    .from('mural_artes')
    .insert([artworkData])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Adiciona uma reação a uma arte (usando RPC para atomicidade)
 */
export async function addReacao(arteId, emoji) {
  // Nota: Requer criar uma function RPC 'increment_reaction' no Supabase
  const { error } = await supabase.rpc('increment_reaction', {
    p_arte_id: arteId,
    p_emoji: emoji
  })
  
  if (error) {
    console.error('Falha na RPC, tentando fallback manual (não atômico)...', error)
    // Fallback básico caso a RPC não exista ainda
    const { data: arte } = await supabase.from('mural_artes').select('reacoes').eq('id', arteId).single()
    if (arte) {
      const reacoes = arte.reacoes || {}
      reacoes[emoji] = (reacoes[emoji] || 0) + 1
      await supabase.from('mural_artes').update({ reacoes }).eq('id', arteId)
    }
  }
}
