import React from 'react'
import { Volume2, VolumeX, Settings } from 'lucide-react'

const styles = {
  container: {
    position: 'fixed',
    bottom: '28px',
    left: '28px',
    zIndex: 1000,
    fontFamily: 'Nunito, sans-serif',
  },
  mainButton: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  panel: {
    position: 'absolute',
    bottom: '60px',
    left: '0',
    width: '180px',
    background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    background: 'rgba(255,255,255,0.2)',
    outline: 'none',
    marginBottom: '12px',
  },
  toggleBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
}

export default function AudioControls({
  muted,
  isPlaying,
  bgmVolume,
  sfxVolume,
  showPanel,
  onToggle,
  onPlay,
  onBgmVolumeChange,
  onSfxVolumeChange,
  onPanelToggle,
}) {
  return (
    <div style={styles.container}>
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
        }
      `}</style>

      <button
        style={styles.mainButton}
        onClick={onPanelToggle}
        title="Configurações de áudio"
      >
        <Settings size={20} />
      </button>

      {showPanel && (
        <div style={styles.panel}>
          <div style={styles.label}>
            <span>Música</span>
            <span>{Math.round(bgmVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgmVolume}
            onChange={(e) => onBgmVolumeChange(parseFloat(e.target.value))}
            style={styles.slider}
          />

          <div style={styles.label}>
            <span>Efeitos</span>
            <span>{Math.round(sfxVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVolume}
            onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
            style={styles.slider}
          />

          <button style={styles.toggleBtn} onClick={onToggle}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {muted ? 'Ativar' : 'Silenciar'}
          </button>
        </div>
      )}
    </div>
  )
}