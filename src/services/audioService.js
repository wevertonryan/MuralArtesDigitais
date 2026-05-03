const BGM_TRACKS = [
  '/sounds/bgm/music1.mp3',
  '/sounds/bgm/music2.mp3',
  '/sounds/bgm/music3.mp3',
]

const SFX = [
  'click',
  'draw',
  'hover',
  'publish',
  'reaction',
  'sparkle',
]

class AudioService {
  constructor() {
    this.bgm = null
    this.currentTrackIndex = 0
    this.sfxCache = {}
    this.muted = false
    this.bgmVolume = 0.5
    this.sfxVolume = 0.3
    this.isPlaying = false
  }

  playBgm() {
    if (this.muted) return
    
    if (this.bgm) {
      this.bgm.pause()
      this.bgm.onended = null
    }
    
    this.bgm = new Audio(BGM_TRACKS[this.currentTrackIndex])
    this.bgm.loop = false
    this.bgm.volume = this.bgmVolume
    
    this.bgm.onended = () => {
      this.nextTrack()
    }
    
    this.bgm.play().catch(() => {})
    this.isPlaying = true
  }

  stopBgm() {
    if (this.bgm) {
      this.bgm.pause()
      this.bgm.onended = null
      this.bgm = null
    }
    this.isPlaying = false
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % BGM_TRACKS.length
    this.playBgm()
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + BGM_TRACKS.length) % BGM_TRACKS.length
    this.playBgm()
  }

  playSfx(name) {
    if (this.muted || !SFX.includes(name)) return
    
    let audio = this.sfxCache[name]
    if (!audio) {
      audio = new Audio(`/sounds/sfx/${name}.mp3`)
      this.sfxCache[name] = audio
    }
    
    audio.volume = this.sfxVolume
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  setBgmVolume(v) {
    this.bgmVolume = v
    if (this.bgm) {
      this.bgm.volume = v
    }
  }

  setSfxVolume(v) {
    this.sfxVolume = v
  }

  toggle() {
    this.muted = !this.muted
    
    if (this.muted) {
      this.stopBgm()
    } else {
      this.playBgm()
    }
    
    return this.muted
  }

  getState() {
    return {
      muted: this.muted,
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrackIndex,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
    }
  }
}

export const audioService = new AudioService()