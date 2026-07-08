import { useState, useCallback, useEffect, useRef } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import { StartMenu } from '@/components/StartMenu';
import { CraftingPanel } from '@/components/CraftingPanel';
import { DeathScreen } from '@/components/DeathScreen';
import { MobileUI } from '@/components/MobileUI';
import { createGameState, startGame, gameLoop, resizeCanvas, placeBlock, eatFood, respawn } from '@/game/engine';
import type { GameState } from '@/game/engine';
import './App.css';

function App() {
  const [showMenu, setShowMenu] = useState(true);
  const [showCrafting, setShowCrafting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [deathReason, setDeathReason] = useState('');
  const [score, setScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [hotbar, setHotbar] = useState<number[]>([1, 2, 3, 4, 13, 6, 15, 16]); // Default hotbar
  const gameStateRef = useRef<GameState | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('touchstart', checkMobile);
    return () => window.removeEventListener('touchstart', checkMobile);
  }, []);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    const state = createGameState(canvas);
    gameStateRef.current = state;

    // Set up state change callback
    state.onStateChange = (changes) => {
      if (changes.gameOver !== undefined) {
        setGameOver(changes.gameOver);
        if (changes.deathReason) setDeathReason(changes.deathReason);
        if (changes.gameOver === false) {
          setScore(state.score);
        }
      }
    };

    // Start the game loop
    gameLoop(state);
  }, []);

  const handleStart = useCallback((daySpeed: number) => {
    setShowMenu(false);
    if (gameStateRef.current) {
      startGame(gameStateRef.current, daySpeed);
    }
  }, []);

  // Input handling
  useEffect(() => {
    if (!gameStateRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current!;

      if (showCrafting) {
        if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
          setShowCrafting(false);
          state.craftingOpen = false;
          state.crafting.clear(state.inventory);
        }
        return;
      }

      state.keys[e.key] = true;

      // Hotbar slots
      if (e.key >= '1' && e.key <= '8') {
        const slot = parseInt(e.key) - 1;
        state.slot = slot;
        setActiveSlot(slot);
      }

      if (e.key === 'e' || e.key === 'E') {
        setShowCrafting(true);
        state.craftingOpen = true;
      }

      if (e.key === 'f' || e.key === 'F') {
        eatFood(state);
        setInventory({ ...state.inventory });
      }

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameStateRef.current) {
        gameStateRef.current.keys[e.key] = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameStateRef.current) return;
      const canvas = gameStateRef.current.canvas;
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.mx = e.clientX - rect.left;
      gameStateRef.current.my = e.clientY - rect.top;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!gameStateRef.current || showCrafting) return;
      e.preventDefault();
      if (e.button === 0) {
        gameStateRef.current.mleft = true;
      }
      if (e.button === 2) {
        placeBlock(gameStateRef.current);
        setInventory({ ...gameStateRef.current.inventory });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (gameStateRef.current && e.button === 0) {
        gameStateRef.current.mleft = false;
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const handleWheel = (e: WheelEvent) => {
      if (!gameStateRef.current) return;
      e.preventDefault();
      const newSlot = (gameStateRef.current.slot + (e.deltaY > 0 ? 1 : -1) + gameStateRef.current.hotbar.length)
        % gameStateRef.current.hotbar.length;
      gameStateRef.current.slot = newSlot;
      setActiveSlot(newSlot);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gameStateRef.current) return;
      e.preventDefault();
      const canvas = gameStateRef.current.canvas;
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.mx = e.touches[0].clientX - rect.left;
      gameStateRef.current.my = e.touches[0].clientY - rect.top;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!gameStateRef.current || showCrafting) return;
      e.preventDefault();
      const canvas = gameStateRef.current.canvas;
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.mx = e.touches[0].clientX - rect.left;
      gameStateRef.current.my = e.touches[0].clientY - rect.top;
      gameStateRef.current.mleft = true;
    };

    const handleTouchEnd = () => {
      if (gameStateRef.current) {
        gameStateRef.current.mleft = false;
      }
    };

    const handleResize = () => {
      if (gameStateRef.current) {
        resizeCanvas(gameStateRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [showCrafting, inventory]);

  // Sync state from game engine
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameStateRef.current) {
        setScore(gameStateRef.current.score);
        setActiveSlot(gameStateRef.current.slot);
        if (!showCrafting) {
          setInventory({ ...gameStateRef.current.inventory });
          setHotbar([...gameStateRef.current.hotbar]);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [showCrafting]);

  // Mobile handlers
  const handleMoveLeft = useCallback((active: boolean) => {
    if (gameStateRef.current) {
      gameStateRef.current.keys['ArrowLeft'] = active;
      gameStateRef.current.keys['a'] = active;
      gameStateRef.current.keys['A'] = active;
    }
  }, []);

  const handleMoveRight = useCallback((active: boolean) => {
    if (gameStateRef.current) {
      gameStateRef.current.keys['ArrowRight'] = active;
      gameStateRef.current.keys['d'] = active;
      gameStateRef.current.keys['D'] = active;
    }
  }, []);

  const handleJump = useCallback((active: boolean) => {
    if (gameStateRef.current) {
      gameStateRef.current.keys['ArrowUp'] = active;
      gameStateRef.current.keys['w'] = active;
      gameStateRef.current.keys['W'] = active;
      gameStateRef.current.keys[' '] = active;
    }
  }, []);

  const handleAction = useCallback((active: boolean) => {
    if (gameStateRef.current) {
      gameStateRef.current.mleft = active;
    }
  }, []);

  const handlePlace = useCallback(() => {
    if (gameStateRef.current) {
      placeBlock(gameStateRef.current);
      setInventory({ ...gameStateRef.current.inventory });
    }
  }, []);

  const handleDigDown = useCallback(() => {
    if (!gameStateRef.current) return;
    const state = gameStateRef.current;
    const tx = Math.floor((state.pl.x + state.pl.w / 2) / 32);
    const ty = Math.floor((state.pl.y + state.pl.h) / 32);
    state.mx = tx * 32 + 16 - state.cam.renderX;
    state.my = ty * 32 + 16 - state.cam.y;
    state.mleft = true;
    setTimeout(() => { state.mleft = false; }, 350);
  }, []);

  const handleCraft = useCallback(() => {
    if (gameStateRef.current) {
      setShowCrafting(true);
      gameStateRef.current.craftingOpen = true;
    }
  }, []);

  const handleEat = useCallback(() => {
    if (gameStateRef.current) {
      eatFood(gameStateRef.current);
      setInventory({ ...gameStateRef.current.inventory });
    }
  }, []);

  const handleSlotChange = useCallback((slot: number) => {
    if (gameStateRef.current) {
      gameStateRef.current.slot = slot;
      setActiveSlot(slot);
    }
  }, []);

  const handleCraftingClose = useCallback(() => {
    if (gameStateRef.current) {
      gameStateRef.current.craftingOpen = false;
      gameStateRef.current.crafting.clear(gameStateRef.current.inventory);
      setInventory({ ...gameStateRef.current.inventory });
    }
    setShowCrafting(false);
  }, []);

  const handleCraftingCraft = useCallback(() => {
    if (gameStateRef.current) {
      const result = gameStateRef.current.crafting.craft(
        gameStateRef.current.inventory,
        gameStateRef.current.hotbar
      );
      if (result.success) {
        setInventory({ ...gameStateRef.current.inventory });
        setHotbar([...gameStateRef.current.hotbar]);
      }
    }
  }, []);

  const handleInventoryChange = useCallback((inv: Record<number, number>, hb: number[]) => {
    if (gameStateRef.current) {
      gameStateRef.current.inventory = inv;
      gameStateRef.current.hotbar = hb;
      setInventory({ ...inv });
      setHotbar([...hb]);
    }
  }, []);

  const handleRespawn = useCallback(() => {
    if (gameStateRef.current) {
      respawn(gameStateRef.current);
      setGameOver(false);
      setScore(gameStateRef.current.score);
    }
  }, []);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: '#000',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Courier New', monospace",
      }}
    >
      <GameCanvas onCanvasReady={handleCanvasReady} />

      {showMenu && <StartMenu onStart={handleStart} />}

      {showCrafting && gameStateRef.current && (
        <CraftingPanel
          crafting={gameStateRef.current.crafting}
          inventory={inventory}
          hotbar={hotbar}
          onCraft={handleCraftingCraft}
          onClose={handleCraftingClose}
          onInventoryChange={handleInventoryChange}
        />
      )}

      {gameOver && (
        <DeathScreen
          reason={deathReason}
          score={score}
          onRespawn={handleRespawn}
        />
      )}

      {isMobile && !showMenu && (
        <MobileUI
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onJump={handleJump}
          onAction={handleAction}
          onPlace={handlePlace}
          onDigDown={handleDigDown}
          onCraft={handleCraft}
          onEat={handleEat}
          onSlotChange={handleSlotChange}
          activeSlot={activeSlot}
        />
      )}
    </div>
  );
}

export default App;
