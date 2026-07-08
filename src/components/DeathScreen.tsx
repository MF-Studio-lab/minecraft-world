interface DeathScreenProps {
  reason: string;
  score: number;
  onRespawn: () => void;
}

export function DeathScreen({ reason, score, onRespawn }: DeathScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(180, 20, 20, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        color: 'white',
      }}
    >
      <h1
        style={{
          fontSize: '4em',
          color: '#ff4444',
          textShadow: '3px 3px #000',
          marginBottom: '20px',
        }}
      >
        💀 你死了！
      </h1>
      <p style={{ fontSize: '1.5em', margin: '10px' }}>{reason}</p>
      <p style={{ fontSize: '1.5em', margin: '10px' }}>
        分數: <span>{score}</span>
      </p>
      <button
        onClick={onRespawn}
        style={{
          padding: '15px 40px',
          fontSize: '1.3em',
          background: '#e74c3c',
          color: 'white',
          border: '2px solid #c0392b',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        🔄 重新開始
      </button>
    </div>
  );
}
