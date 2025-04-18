import useGameStore from '../store/gameStore';

const Navbar = () => {
  const { crypto, research, scripts, lives } = useGameStore();

  const statStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#001B34',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid #0099FF',
    position: 'relative',
    minWidth: '150px',
    ':before': {
      content: '""',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      border: '2px solid #0066CC',
      borderRadius: '6px',
      opacity: 0.5,
      pointerEvents: 'none'
    }
  };

  const iconStyle = {
    color: '#00CCFF',
    fontSize: '1.2rem',
    textShadow: '0 0 10px #00CCFF'
  };

  const valueStyle = {
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: '1.1rem',
    color: '#FFFFFF',
    textShadow: '0 0 5px #00CCFF'
  };

  const labelStyle = {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.9rem',
    color: '#0099FF',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(0, 27, 52, 0.8)',
      padding: '1rem 2rem',
      borderBottom: '1px solid #0066CC',
      boxShadow: '0 2px 20px rgba(0, 102, 204, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      ':before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #0099FF, transparent)'
      }
    }}>
      <div style={statStyle}>
        <span style={iconStyle}>⚡</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={labelStyle}>Crypto</span>
          <span style={valueStyle}>{crypto}</span>
        </div>
      </div>
      
      <div style={statStyle}>
        <span style={iconStyle}>🔬</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={labelStyle}>Research</span>
          <span style={valueStyle}>{research}</span>
        </div>
      </div>
      
      <div style={statStyle}>
        <span style={iconStyle}>📜</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={labelStyle}>Scripts</span>
          <span style={valueStyle}>{scripts}</span>
        </div>
      </div>
      
      
    </nav>
  );
};

export default Navbar; 