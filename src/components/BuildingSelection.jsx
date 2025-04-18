import React, { useEffect, useState } from 'react';
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

  return (
    <div 
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#000000',
        border: '2px solid #00ff00',
        padding: '1rem',
        zIndex: 1000,
        minWidth: '200px'
      }}
      onClick={handleContainerClick}
    >
      <h3 style={{ color: '#00ff00', margin: '0 0 1rem 0', textAlign: 'center' }}>Build on Module</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => handleBuild('ram')}
          disabled={crypto < buildingCosts.ram}
          style={{
            backgroundColor: crypto >= buildingCosts.ram ? '#00ff00' : '#333333',
            color: '#000000',
            border: 'none',
            padding: '0.5rem',
            cursor: crypto >= buildingCosts.ram ? 'pointer' : 'not-allowed',
            fontFamily: 'monospace'
          }}
        >
          RAM (2GB) - {buildingCosts.ram} Crypto
        </button>
        <button
          onClick={() => handleBuild('firewall')}
          disabled={crypto < buildingCosts.firewall}
          style={{
            backgroundColor: crypto >= buildingCosts.firewall ? '#00ff00' : '#333333',
            color: '#000000',
            border: 'none',
            padding: '0.5rem',
            cursor: crypto >= buildingCosts.firewall ? 'pointer' : 'not-allowed',
            fontFamily: 'monospace'
          }}
        >
          Firewall - {buildingCosts.firewall} Crypto
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            backgroundColor: '#333333',
            color: '#00ff00',
            border: '1px solid #00ff00',
            padding: '0.5rem',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BuildingSelection; 