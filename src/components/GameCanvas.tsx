import { useRef, useEffect } from 'react';

interface GameCanvasProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export function GameCanvas({ onCanvasReady }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      id="game-canvas"
      style={{
        display: 'block',
        cursor: 'crosshair',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
