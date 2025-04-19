import useGameStore from '../store/gameStore';

const Navbar = () => {
  const { crypto, research, scripts, lives } = useGameStore();

  const statStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem',
    position: 'relative',
    minWidth: '120px',
  };

  const iconStyle = {
    color: '#00CCFF',
    fontSize: '1rem',
    textShadow: '0 0 10px #00CCFF'
  };

  const valueStyle = {
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: '1rem',
    color: '#FFFFFF',
    textShadow: '0 0 5px #00CCFF'
  };

  const labelStyle = {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.8rem',
    color: '#0099FF',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(0, 27, 52, 0.95)',
      padding: '0.25rem',
      borderBottom: '1px solid #0066CC',
      boxShadow: '0 2px 10px rgba(0, 102, 204, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '40px',
      boxSizing: 'border-box',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px'
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
      </div>
    </nav>
  );
};

export default Navbar; 