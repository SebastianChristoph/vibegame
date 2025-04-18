import useGameStore from '../store/gameStore';

const Navbar = () => {
  const { crypto, research, scripts, lives } = useGameStore();

  return (
    <nav style={{
      backgroundColor: '#000000',
      padding: '1rem',
      borderBottom: '2px solid #00ff00',
      boxShadow: '0 0 10px #00ff00',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      fontFamily: 'monospace',
      color: '#00ff00'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#00ff00' }}>⚡</span>
        <span>Crypto: {crypto}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#00ff00' }}>🔬</span>
        <span>Research: {research}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#00ff00' }}>📜</span>
        <span>Scripts: {scripts}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#00ff00' }}>❤️</span>
        <span>Lives: {lives}</span>
      </div>
    </nav>
  );
};

export default Navbar; 