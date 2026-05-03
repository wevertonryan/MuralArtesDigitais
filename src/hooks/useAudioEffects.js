import { useEffect, useRef } from 'react'
import { useMuralStore } from '@/store/muralStore'
import { audioService } from '@/services/audioService'

export function useAudioEffects() {
  const view = useMuralStore(s => s.view)
  const prevView = useRef(view)
  
  useEffect(() => {
    if (prevView.current !== view) {
      if (view === 'drawing') {
        audioService.playSfx('draw')
      } else if (view === 'detail') {
        audioService.playSfx('click')
      } else if (view === 'mural') {
        audioService.playSfx('sparkle')
      } else if (view === 'placement') {
        audioService.playSfx('click')
      }
      prevView.current = view
    }
  }, [view])

  useEffect(() => {
    const handleHover = (e) => {
      if (e.target.closest('button') || e.target.closest('.hoverable')) {
        audioService.playSfx('hover')
      }
    }
    document.addEventListener('mouseover', handleHover, true)
    return () => document.removeEventListener('mouseover', handleHover, true)
  }, [])

  const playClick = () => audioService.playSfx('click')
  const playPublish = () => audioService.playSfx('publish')
  const playReaction = () => audioService.playSfx('reaction')
  const playSparkle = () => audioService.playSfx('sparkle')
  const playDraw = () => audioService.playSfx('draw')

  return { playClick, playPublish, playReaction, playSparkle, playDraw }
}