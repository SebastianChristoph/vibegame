import React from 'react';
import { useGameStore } from '../stores/gameStore';

const BuildingSelection = ({ moduleId, onClose }) => {
  const { crypto, buildingCosts, buildOnModule } = useGameStore();

  const handleBuild = (type) => {
    if (crypto >= buildingCosts[type]) {
      buildOnModule(moduleId, type);
      onClose();
    }
  };

  // Prevent clicks from reaching elements below
  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  const menuStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: 'rgba(0, 27, 52, 0.95)',
    border: '1px solid #0099FF',
    borderRadius: '8px',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 30px rgba(0, 153, 255, 0.4)',
    width: '300px',
    zIndex: 1000,
  };

  const titleStyle = {
    color: '#FFFFFF',
    fontSize: '1.1rem',
    fontFamily: 'Orbitron, sans-serif',
    textAlign: 'center',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 500,
    textShadow: '0 0 10px #00CCFF'
  };

  const ramStyle = {
    color: '#0099FF',
    fontSize: '1.3rem',
    fontFamily: 'Share Tech Mono, monospace',
    textAlign: 'center',
    marginBottom: '15px',
    textShadow: '0 0 10px #00CCFF'
  };

  const baseButtonStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '8px',
    border: '1px solid #0099FF',
    borderRadius: '4px',
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  const activeButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'rgba(0, 102, 204, 0.4)',
    color: '#FFFFFF',
  };

  const disabledButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'rgba(0, 27, 52, 0.6)',
    color: '#0099FF',
    cursor: 'not-allowed',
    opacity: 0.7
  };

  const cancelButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'rgba(0, 27, 52, 0.6)',
    color: '#0099FF',
    marginBottom: 0,
    ':hover': {
      backgroundColor: 'rgba(0, 153, 255, 0.2)',
      transform: 'translateY(-1px)',
      boxShadow: '0 0 15px rgba(0, 153, 255, 0.3)'
    }
  };

  const iconStyle = {
    fontSize: '1.2rem',
    textShadow: '0 0 5px #00CCFF',
    marginRight: '8px'
  };

  // Add hover styles using CSS
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .building-button:not(:disabled):hover {
      background-color: rgba(0, 153, 255, 0.5) !important;
      transform: translateY(-1px);
      box-shadow: 0 0 15px rgba(0, 153, 255, 0.3);
    }
    .cancel-button:hover {
      background-color: rgba(0, 153, 255, 0.2) !important;
      transform: translateY(-1px);
      box-shadow: 0 0 15px rgba(0, 153, 255, 0.3);
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div style={menuStyle} onClick={handleContainerClick}>
      <div style={titleStyle}>Build on Module</div>
      <div style={ramStyle}>Available RAM: 4GB</div>
      <button
        className="building-button"
        style={crypto >= buildingCosts.ram ? activeButtonStyle : disabledButtonStyle}
        onClick={() => handleBuild('ram')}
        disabled={crypto < buildingCosts.ram}
      >
        <span style={iconStyle}>⚡</span>
        RAM (+2GB) - 50 Crypto
      </button>
      <button
        className="building-button"
        style={crypto >= buildingCosts.firewall ? activeButtonStyle : disabledButtonStyle}
        onClick={() => handleBuild('firewall')}
        disabled={crypto < buildingCosts.firewall}
      >
        <span style={iconStyle}>🛡️</span>
        Firewall (-2GB RAM) - 75 Crypto
      </button>
      <button
        className="cancel-button"
        style={cancelButtonStyle}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default BuildingSelection; 