import { useState, useCallback, useEffect } from 'react'
import { audioService } from '@/services/audioService'

export function useAudio() {
  const [state, setState] = useState({
    muted: false,
    isPlaying: false,
    currentTrack: 0,
    bgmVolume: 0.5,
    sfxVolume: 0.3,
  })
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    setState(audioService.getState())
  }, [])

  const playMusic = useCallback(() => {
    audioService.playBgm()
    setState(s => ({ ...s, isPlaying: true, muted: false }))
  }, [])

  const stopMusic = useCallback(() => {
    audioService.stopBgm()
    setState(s => ({ ...s, isPlaying: false }))
  }, [])

  const toggleMusic = useCallback(() => {
    const muted = audioService.toggle()
    setState(s => ({ ...s, muted, isPlaying: !muted }))
  }, [])

  const nextTrack = useCallback(() => {
    audioService.nextTrack()
  }, [])

  const prevTrack = useCallback(() => {
    audioService.prevTrack()
  }, [])

  const setBgmVolume = useCallback((v) => {
    audioService.setBgmVolume(v)
    setState(s => ({ ...s, bgmVolume: v }))
  }, [])

  const setSfxVolume = useCallback((v) => {
    audioService.setSfxVolume(v)
    setState(s => ({ ...s, sfxVolume: v }))
  }, [])

  const playSfx = useCallback((name) => {
    audioService.playSfx(name)
  }, [])

  return {
    ...state,
    showPanel,
    setShowPanel,
    playMusic,
    stopMusic,
    toggleMusic,
    nextTrack,
    prevTrack,
    setBgmVolume,
    setSfxVolume,
    playSfx,
  }
}