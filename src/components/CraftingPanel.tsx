import { useState, useEffect } from 'react';
import { CraftingSystem } from '@/game/crafting';
import { EMOJIS, NAMES, RECIPES, AIR, GRASS, DIRT, SAND } from '@/game/constants';

interface CraftingPanelProps {
  crafting: CraftingSystem;
  inventory: Record<number, number>;
  hotbar: number[];
  onCraft: () => void;
  onClose: () => void;
  onInventoryChange: (inv: Record<number, number>, hotbar: number[]) => void;
}

export function CraftingPanel({
  crafting,
  inventory,
  hotbar,
  onCraft,
  onClose,
  onInventoryChange,
}: CraftingPanelProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [localGrid, setLocalGrid] = useState<number[]>([...crafting.grid]);
  const [currentRecipe, setCurrentRecipe] = useState<typeof RECIPES[0] | null>(crafting.currentRecipe);

  // Sync with engine
  useEffect(() => {
    setLocalGrid([...crafting.grid]);
    setCurrentRecipe(crafting.currentRecipe);
  }, [crafting.grid, crafting.currentRecipe]);

  const inventoryItems = Object.entries(inventory)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ id: parseInt(id), count }));

  function clickCraftSlot(idx: number) {
    const newGrid = [...localGrid];
    if (newGrid[idx] > 0) {
      // Return to inventory
      inventory[newGrid[idx]] = (inventory[newGrid[idx]] || 0) + 1;
      newGrid[idx] = 0;
    } else if (selectedItem !== null && (inventory[selectedItem] || 0) > 0) {
      inventory[selectedItem]--;
      if (inventory[selectedItem] <= 0) delete inventory[selectedItem];
      newGrid[idx] = selectedItem;
    }
    setLocalGrid(newGrid);
    crafting.grid = newGrid;
    crafting.checkRecipe();
    setCurrentRecipe(crafting.currentRecipe);
    onInventoryChange({ ...inventory }, [...hotbar]);
  }

  function handleCraft() {
    onCraft();
    setLocalGrid([...crafting.grid]);
    setCurrentRecipe(crafting.currentRecipe);
  }

  function handleAutoCraft() {
    crafting.autoCraft(inventory, hotbar);
    setLocalGrid([...crafting.grid]);
    setCurrentRecipe(crafting.currentRecipe);
    onInventoryChange({ ...inventory }, [...hotbar]);
  }

  function handleAutoCraftRecipe(recipe: typeof RECIPES[0]) {
    if (crafting.canCraftRecipe(recipe, inventory)) {
      // Clear grid
      for (let i = 0; i < 9; i++) {
        if (crafting.grid[i] > 0) {
          inventory[crafting.grid[i]] = (inventory[crafting.grid[i]] || 0) + 1;
        }
      }
      crafting.grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];

      // Place recipe items
      for (let i = 0; i < 9; i++) {
        if (recipe.grid[i] !== 0) {
          crafting.grid[i] = recipe.grid[i];
          inventory[recipe.grid[i]]--;
          if (inventory[recipe.grid[i]] <= 0) delete inventory[recipe.grid[i]];
        }
      }

      // Add result
      inventory[recipe.result] = (inventory[recipe.result] || 0) + recipe.count;

      // Add to hotbar
      if (!hotbar.includes(recipe.result)) {
        for (let i = 0; i < hotbar.length; i++) {
          if (hotbar[i] === AIR || hotbar[i] === GRASS || hotbar[i] === DIRT || hotbar[i] === SAND) {
            hotbar[i] = recipe.result;
            break;
          }
        }
      }

      crafting.checkRecipe();
      setLocalGrid([...crafting.grid]);
      setCurrentRecipe(crafting.currentRecipe);
      onInventoryChange({ ...inventory }, [...hotbar]);
    }
  }

  const craftableRecipes = RECIPES.map((recipe) => ({
    recipe,
    canCraft: crafting.canCraftRecipe(recipe, inventory),
  }));

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(30,20,10,0.95)',
        border: '3px solid #8B4513',
        borderRadius: '12px',
        padding: '20px',
        zIndex: 100,
        minWidth: '500px',
        maxHeight: '85vh',
        overflowY: 'auto',
        color: '#fff',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '15px',
          background: '#c0392b',
          color: 'white',
          border: 'none',
          padding: '5px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ✕ 關閉
      </button>

      <h2 style={{ color: '#ffd700', textAlign: 'center', margin: '0 0 15px 0' }}>
        🔨 合成表
      </h2>
      <h3 style={{ color: '#aaa', textAlign: 'center', margin: '10px 0', fontSize: '14px' }}>
        👇 點擊下方背包物品，再點擊上方九宮格放入
      </h3>

      {/* Crafting Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 70px)',
          gap: '4px',
          margin: '0 auto 15px',
          width: 'fit-content',
          padding: '10px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
        }}
      >
        {localGrid.map((item, i) => (
          <div
            key={i}
            onClick={() => clickCraftSlot(i)}
            style={{
              width: '70px',
              height: '70px',
              background: item > 0 ? '#4a3a2a' : '#5a3a1a',
              border: '2px solid #8B4513',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'white',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffd700';
              e.currentTarget.style.background = '#6a4a2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#8B4513';
              e.currentTarget.style.background = item > 0 ? '#4a3a2a' : '#5a3a1a';
            }}
          >
            {item > 0 ? EMOJIS[item] || '❓' : ''}
            {item > 0 && (
              <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '12px', color: '#fff' }}>
                1
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Result */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          margin: '15px 0',
          padding: '10px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#4a2a0a',
            border: '2px solid #8B4513',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}
        >
          {currentRecipe ? (EMOJIS[currentRecipe.result] || '❓') : '❓'}
        </div>
        <span style={{ color: '#ffd700', fontSize: '28px' }}>➡</span>
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#4a2a0a',
            border: `2px solid ${currentRecipe ? '#ffd700' : '#8B4513'}`,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}
        >
          {currentRecipe ? (EMOJIS[currentRecipe.result] || '❓') : '❓'}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleCraft}
          disabled={!currentRecipe}
          style={{
            padding: '12px 40px',
            fontSize: '16px',
            background: currentRecipe ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: currentRecipe ? 'pointer' : 'not-allowed',
            margin: '5px',
            fontWeight: 'bold',
          }}
        >
          🔨 手動合成
        </button>
        <button
          onClick={handleAutoCraft}
          style={{
            padding: '12px 40px',
            fontSize: '16px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '5px',
            fontWeight: 'bold',
          }}
        >
          ⚡ 一鍵合成
        </button>
      </div>

      {/* Inventory */}
      <div
        style={{
          margin: '10px 0',
          padding: '10px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          maxHeight: '120px',
          overflowY: 'auto',
        }}
      >
        <h4 style={{ color: '#ffd700', margin: '0 0 8px 0', fontSize: '14px' }}>
          📦 背包物品（點擊選擇）
        </h4>
        {inventoryItems.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center' }}>背包是空的</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
              gap: '4px',
            }}
          >
            {inventoryItems.map(({ id, count }) => (
              <div
                key={id}
                onClick={() => setSelectedItem(selectedItem === id ? null : id)}
                style={{
                  background: selectedItem === id ? '#6a5a4a' : '#4a3a2a',
                  border: `1px solid ${selectedItem === id ? '#ffd700' : '#6a5a4a'}`,
                  borderRadius: '4px',
                  padding: '5px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  transition: 'all 0.1s',
                }}
                title={NAMES[id] || '?'}
              >
                {EMOJIS[id] || '❓'}
                <span
                  style={{
                    fontSize: '10px',
                    color: '#fff',
                    display: 'block',
                  }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe List */}
      <h3
        style={{
          color: '#aaa',
          textAlign: 'center',
          margin: '10px 0',
          fontSize: '14px',
        }}
      >
        📋 可合成配方（點擊一鍵合成）
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '10px',
          maxHeight: '200px',
          overflowY: 'auto',
        }}
      >
        {craftableRecipes.map(({ recipe, canCraft }) => (
          <div
            key={recipe.result + recipe.name}
            onClick={() => canCraft && handleAutoCraftRecipe(recipe)}
            style={{
              background: '#3a2a1a',
              border: `2px solid ${canCraft ? '#5a3a1a' : '#3a2a1a'}`,
              borderRadius: '6px',
              padding: '10px',
              cursor: canCraft ? 'pointer' : 'not-allowed',
              textAlign: 'center',
              color: '#ddd',
              fontSize: '12px',
              opacity: canCraft ? 1 : 0.4,
              transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => {
              if (canCraft) {
                e.currentTarget.style.borderColor = '#ffd700';
                e.currentTarget.style.background = '#4a3a2a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = canCraft ? '#5a3a1a' : '#3a2a1a';
              e.currentTarget.style.background = '#3a2a1a';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '4px' }}>
              {EMOJIS[recipe.result] || '❓'}
            </span>
            {recipe.name}
          </div>
        ))}
      </div>
    </div>
  );
}
