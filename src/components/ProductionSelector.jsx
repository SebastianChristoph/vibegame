import React from 'react';
import useGameStore from '../store/gameStore';

const ProductionSelector = ({ onClose }) => {
  const { productionMode, setProductionMode, getTotalRAM, getProductionRate } = useGameStore();
  const rate = getProductionRate();

  const handleModeSelect = (mode) => {
    setProductionMode(mode);
    if (window.game && window.game.scene.scenes[0]) {
      const scene = window.game.scene.scenes[0];
      scene.updateProductionDisplay(mode);
    }
    onClose();
  };

  const buttonStyle = (isSelected) => ({
    backgroundColor: isSelected ? 'rgba(0, 102, 204, 0.4)' : 'rgba(0, 27, 52, 0.6)',
    color: isSelected ? '#FFFFFF' : '#0099FF',
    border: '1px solid #0099FF',
    padding: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    position: 'relative',
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    ':before': isSelected ? {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(0, 204, 255, 0.1), transparent)',
      transform: 'translateX(-100%)',
      animation: 'shimmer 2s infinite'
    } : {},
    ':hover': {
      backgroundColor: isSelected ? 'rgba(0, 153, 255, 0.5)' : 'rgba(0, 153, 255, 0.2)',
      transform: 'translateY(-1px)',
      boxShadow: '0 0 15px rgba(0, 153, 255, 0.3)'
    }
  });

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 27, 52, 0.95)',
      border: '1px solid #0099FF',
      borderRadius: '8px',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 30px rgba(0, 153, 255, 0.4)',
      textAlign: 'center',
      zIndex: 1000,
      minWidth: '280px',
      ':before': {
        content: '""',
        position: 'absolute',
        top: '-2px',
        left: '-2px',
        right: '-2px',
        bottom: '-2px',
        border: '2px solid #0066CC',
        borderRadius: '10px',
        opacity: 0.5,
        pointerEvents: 'none'
      }
    }}>
      <div style={{ 
        color: '#FFFFFF', 
        marginBottom: '1.5rem', 
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '1.1rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <span style={{ color: '#0099FF', fontSize: '0.9rem' }}>Production Rate</span>
        <span style={{ 
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '1.3rem',
          textShadow: '0 0 10px #00CCFF'
        }}>
          {rate} units/sec
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          onClick={() => handleModeSelect('crypto')}
          style={buttonStyle(productionMode === 'crypto')}
        >
          <span style={{ fontSize: '1.2rem', textShadow: '0 0 5px #00CCFF' }}>⚡</span>
          Mine Crypto
        </button>
        <button
          onClick={() => handleModeSelect('research')}
          style={buttonStyle(productionMode === 'research')}
        >
          <span style={{ fontSize: '1.2rem', textShadow: '0 0 5px #00CCFF' }}>🔬</span>
          Research
        </button>
        <button
          onClick={() => handleModeSelect('scripts')}
          style={buttonStyle(productionMode === 'scripts')}
        >
          <span style={{ fontSize: '1.2rem', textShadow: '0 0 5px #00CCFF' }}>📜</span>
          Generate Scripts
        </button>
      </div>
    </div>
  );
};

export default ProductionSelector; 