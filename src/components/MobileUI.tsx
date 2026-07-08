interface MobileUIProps {
  onMoveLeft: (active: boolean) => void;
  onMoveRight: (active: boolean) => void;
  onJump: (active: boolean) => void;
  onAction: (active: boolean) => void;
  onPlace: () => void;
  onDigDown: () => void;
  onCraft: () => void;
  onEat: () => void;
  onSlotChange: (slot: number) => void;
  activeSlot: number;
}

export function MobileUI({
  onMoveLeft,
  onMoveRight,
  onJump,
  onAction,
  onPlace,
  onDigDown,
  onCraft,
  onEat,
  onSlotChange,
  activeSlot,
}: MobileUIProps) {
  const btnStyle = (small = false): React.CSSProperties => ({
    width: small ? '56px' : '68px',
    height: small ? '56px' : '68px',
    borderRadius: '18px',
    border: '2px solid rgba(255,255,255,0.18)',
    background: 'rgba(20,20,20,0.75)',
    color: '#fff',
    fontSize: small ? '20px' : '24px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
    cursor: 'pointer',
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    touchAction: 'manipulation',
  });

  const hotbarItems = ['🟩', '🟫', '⬜', '🪵', '🪵', '🟨', '🪟', '🔥'];

  return (
    <>
      {/* Hotbar */}
      <div
        style={{
          position: 'fixed',
          top: '8px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 91,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => onSlotChange(i)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                border: `2px solid ${activeSlot === i ? '#ffd700' : 'rgba(255,255,255,0.16)'}`,
                background: activeSlot === i ? 'rgba(255,215,0,0.2)' : 'rgba(20,20,20,0.8)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hotbarItems[i] || i + 1}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[4, 5, 6, 7].map((i) => (
            <button
              key={i}
              onClick={() => onSlotChange(i)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                border: `2px solid ${activeSlot === i ? '#ffd700' : 'rgba(255,255,255,0.16)'}`,
                background: activeSlot === i ? 'rgba(255,215,0,0.2)' : 'rgba(20,20,20,0.8)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hotbarItems[i] || i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Controls */}
      <div
        style={{
          position: 'fixed',
          bottom: '14px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          padding: '0 12px',
          zIndex: 90,
          pointerEvents: 'none',
        }}
      >
        {/* Left side - movement */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '40%',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onTouchStart={(e) => { e.preventDefault(); onMoveLeft(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onMoveLeft(false); }}
              onMouseDown={() => onMoveLeft(true)}
              onMouseUp={() => onMoveLeft(false)}
              onMouseLeave={() => onMoveLeft(false)}
              style={btnStyle()}
            >
              ◀
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); onMoveRight(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onMoveRight(false); }}
              onMouseDown={() => onMoveRight(true)}
              onMouseUp={() => onMoveRight(false)}
              onMouseLeave={() => onMoveRight(false)}
              style={btnStyle()}
            >
              ▶
            </button>
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '-4px',
              opacity: 0.9,
            }}
          >
            左右移動（可與右側跳躍同時按）
          </div>
        </div>

        {/* Right side - actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '40%',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onTouchStart={(e) => { e.preventDefault(); onJump(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onJump(false); }}
              onMouseDown={() => onJump(true)}
              onMouseUp={() => onJump(false)}
              onMouseLeave={() => onJump(false)}
              style={btnStyle()}
            >
              ⤴
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); onAction(true); }}
              onTouchEnd={(e) => { e.preventDefault(); onAction(false); }}
              onMouseDown={() => onAction(true)}
              onMouseUp={() => onAction(false)}
              onMouseLeave={() => onAction(false)}
              style={btnStyle()}
            >
              🪓
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); onPlace(); }}
              onMouseDown={() => onPlace()}
              style={btnStyle()}
            >
              🧱
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onTouchStart={(e) => { e.preventDefault(); onDigDown(); }}
              onMouseDown={() => onDigDown()}
              style={btnStyle()}
            >
              🔽
            </button>
            <button
              onClick={onCraft}
              style={btnStyle(true)}
            >
              📦
            </button>
            <button
              onClick={onEat}
              style={btnStyle(true)}
            >
              🍖
            </button>
          </div>
          <div
            style={{
              color: '#fff',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '-4px',
              opacity: 0.9,
            }}
          >
            跳躍/操作/向下挖/合成/吃東西
          </div>
        </div>
      </div>
    </>
  );
}
