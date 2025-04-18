import React from 'react';
import { useGameStore } from '../stores/gameStore';
import './BuildingSelection.css';

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
    fontWeight: 500
  };

  const ramStyle = {
    color: '#0099FF',
    fontSize: '1.3rem',
    fontFamily: 'Share Tech Mono, monospace',
    textAlign: 'center',
    marginBottom: '15px',
    textShadow: '0 0 10px #00CCFF'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '8px',
    backgroundColor: 'rgba(0, 102, 204, 0.4)',
    border: '1px solid #0099FF',
    borderRadius: '4px',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.2s ease'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(0, 27, 52, 0.6)',
    color: '#0099FF',
    cursor: 'not-allowed',
    opacity: 0.7
  };

  const cancelButtonStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'rgba(0, 27, 52, 0.6)',
    border: '1px solid #0099FF',
    borderRadius: '4px',
    color: '#0099FF',
    cursor: 'pointer',
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={menuStyle} onClick={handleContainerClick}>
      <div style={titleStyle}>Build on Module</div>
      <div style={ramStyle}>Available RAM: 4GB</div>
      <button
        style={crypto >= buildingCosts.ram ? buttonStyle : disabledButtonStyle}
        onClick={() => handleBuild('ram')}
        disabled={crypto < buildingCosts.ram}
      >
        <span style={{ fontSize: '1.2rem', textShadow: '0 0 5px #00CCFF', marginRight: '8px' }}>⚡</span>
        RAM (+2GB) - 50 Crypto
      </button>
      <button
        style={crypto >= buildingCosts.firewall ? buttonStyle : disabledButtonStyle}
        onClick={() => handleBuild('firewall')}
        disabled={crypto < buildingCosts.firewall}
      >
        <span style={{ fontSize: '1.2rem', textShadow: '0 0 5px #00CCFF', marginRight: '8px' }}>🛡️</span>
        Firewall (-2GB RAM) - 75 Crypto
      </button>
      <button
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