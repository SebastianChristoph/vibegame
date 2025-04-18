import React from 'react';
import useGameStore from '../store/gameStore';

const ProductionSelector = ({ onClose }) => {
  const { productionMode, setProductionMode, getTotalRAM, getProductionRate } = useGameStore();
  const rate = getProductionRate();

  const handleModeSelect = (mode) => {
    setProductionMode(mode);
    // Ensure the game scene updates
    if (window.game && window.game.scene.scenes[0]) {
      const scene = window.game.scene.scenes[0];
      scene.updateProductionDisplay(mode);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: '#000000',
      border: '2px solid #00ff00',
      padding: '1rem',
      boxShadow: '0 0 10px #00ff00',
      textAlign: 'center',
      zIndex: 1000
    }}>
      <div style={{ color: '#00ff00', marginBottom: '1rem', fontFamily: 'monospace' }}>
        Production Rate: {rate} units/sec
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => handleModeSelect('crypto')}
          style={{
            backgroundColor: productionMode === 'crypto' ? '#00ff00' : '#000000',
            color: productionMode === 'crypto' ? '#000000' : '#00ff00',
            border: '1px solid #00ff00',
            padding: '0.5rem',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          ⚡ Mine Crypto
        </button>
        <button
          onClick={() => handleModeSelect('research')}
          style={{
            backgroundColor: productionMode === 'research' ? '#00ff00' : '#000000',
            color: productionMode === 'research' ? '#000000' : '#00ff00',
            border: '1px solid #00ff00',
            padding: '0.5rem',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          🔬 Research
        </button>
        <button
          onClick={() => handleModeSelect('scripts')}
          style={{
            backgroundColor: productionMode === 'scripts' ? '#00ff00' : '#000000',
            color: productionMode === 'scripts' ? '#000000' : '#00ff00',
            border: '1px solid #00ff00',
            padding: '0.5rem',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          📜 Generate Scripts
        </button>
      </div>
    </div>
  );
};

export default ProductionSelector; 