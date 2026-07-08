import { useState } from 'react';

interface StartMenuProps {
  onStart: (daySpeed: number) => void;
}

export function StartMenu({ onStart }: StartMenuProps) {
  const [daySpeed, setDaySpeed] = useState(0.8);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
          maxWidth: '800px',
        }}
      >
        <h1
          style={{
            fontSize: '2.8em',
            color: '#56d926',
            textShadow: '3px 3px #1a5c0e',
            marginBottom: '16px',
          }}
        >
          ⛏️ 小方塊世界 2.4 ⛏️
        </h1>

        <p style={{ fontSize: '1.05em', color: '#ddd', margin: '7px 0' }}>
          <span className="key-badge">WASD</span> 或{' '}
          <span className="key-badge">方向鍵</span> 移動 &nbsp;|&nbsp;{' '}
          <span className="key-badge">空格</span> 跳躍
        </p>
        <p style={{ fontSize: '1.05em', color: '#ddd', margin: '7px 0' }}>
          <span className="key-badge">左鍵按住</span> 挖掘/攻擊 &nbsp;|&nbsp;{' '}
          <span className="key-badge">右鍵</span> 放置方塊
        </p>
        <p style={{ fontSize: '1.05em', color: '#ddd', margin: '7px 0' }}>
          <span className="key-badge">1~8</span> 切換物品 &nbsp;|&nbsp; 滑鼠滾輪也可以切換
        </p>
        <p style={{ fontSize: '1.05em', color: '#ddd', margin: '7px 0' }}>
          <span className="key-badge">E</span> 打開合成表 &nbsp;|&nbsp;{' '}
          <span className="key-badge">F</span> 吃東西
        </p>
        <p style={{ color: '#4fc3f7', margin: '7px 0' }}>
          手機/平板請橫置，螢幕左右側會出現觸控操作按鈕。
        </p>
        <p style={{ color: '#ffd700', margin: '7px 0' }}>
          ⭐ 挖掘礦石、蓋房子、狩獵動物、合成工具！
        </p>
        <p style={{ color: '#ff6b6b', margin: '7px 0' }}>
          ⚠️ 晚上會出現殭屍和骷髏，小心生存！
        </p>
        <p style={{ color: '#4fc3f7', margin: '7px 0' }}>
          🌊 尋找河流釣魚，探索地底找鑽石！
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            margin: '12px 0',
            fontSize: '1.1em',
          }}
        >
          <label style={{ color: '#ffd700', fontWeight: 'bold' }}>🌅 時間週期:</label>
          <select
            value={daySpeed}
            onChange={(e) => setDaySpeed(parseFloat(e.target.value))}
            style={{
              padding: '8px 15px',
              fontSize: '1em',
              background: '#333',
              color: '#fff',
              border: '2px solid #56d926',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            <option value={0.2}>超慢 (5分鐘)</option>
            <option value={0.4}>慢速 (2.5分鐘)</option>
            <option value={0.8}>正常 (1.25分鐘)</option>
            <option value={1.6}>快速 (37秒)</option>
            <option value={3.2}>超快 (18秒)</option>
          </select>
        </div>

        <button
          onClick={() => onStart(daySpeed)}
          style={{
            marginTop: '26px',
            padding: '14px 52px',
            fontSize: '1.4em',
            background: 'linear-gradient(180deg, #56d926, #3a9c18)',
            color: '#fff',
            border: '2px solid #2d7a10',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            textShadow: '1px 2px #000',
            transition: 'all 0.1s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = 'linear-gradient(180deg, #6bef38, #4ab820)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'linear-gradient(180deg, #56d926, #3a9c18)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.96)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
        >
          🚀 開始遊戲！
        </button>
      </div>
    </div>
  );
}
