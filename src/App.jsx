import GameCanvas from './components/GameCanvas';
import Navbar from './components/Navbar';

function App() {
  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        <GameCanvas />
      </div>
    </div>
  );
}

export default App;
