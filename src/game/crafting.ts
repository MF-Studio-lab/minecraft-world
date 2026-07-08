// ============================================================
// Crafting Module - Crafting System Logic
// ============================================================

import { AIR, GRASS, DIRT, SAND, RECIPES } from './constants';
import type { Recipe } from '@/types/game';

/** Crafting grid state (3x3 = 9 slots) */
export class CraftingSystem {
  grid: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  selectedItem: number | null = null;
  currentRecipe: Recipe | null = null;

  /** Check if grid matches a recipe */
  checkRecipe(): void {
    this.currentRecipe = null;
    for (const recipe of RECIPES) {
      let match = true;
      for (let i = 0; i < 9; i++) {
        if (recipe.grid[i] !== 0 && this.grid[i] !== recipe.grid[i]) {
          match = false;
          break;
        }
        if (recipe.grid[i] === 0 && this.grid[i] !== 0) {
          match = false;
          break;
        }
      }
      if (match) {
        this.currentRecipe = recipe;
        break;
      }
    }
  }

  /** Place item into crafting slot */
  placeItem(slotIdx: number, inventory: Record<number, number>): boolean {
    if (this.grid[slotIdx] > 0) {
      // Return item to inventory
      inventory[this.grid[slotIdx]] = (inventory[this.grid[slotIdx]] || 0) + 1;
      this.grid[slotIdx] = 0;
    } else if (this.selectedItem !== null && (inventory[this.selectedItem] || 0) > 0) {
      inventory[this.selectedItem]--;
      if (inventory[this.selectedItem] <= 0) delete inventory[this.selectedItem];
      this.grid[slotIdx] = this.selectedItem;
    }
    this.checkRecipe();
    return true;
  }

  /** Execute manual craft */
  craft(inventory: Record<number, number>, hotbar: number[]): { success: boolean; message: string } {
    if (!this.currentRecipe) {
      return { success: false, message: '沒有匹配的配方' };
    }

    // Clear grid
    for (let i = 0; i < 9; i++) {
      if (this.currentRecipe.grid[i] !== 0) {
        this.grid[i] = 0;
      }
    }

    // Add result
    const result = this.currentRecipe.result;
    inventory[result] = (inventory[result] || 0) + this.currentRecipe.count;

    // Auto-add to hotbar
    if (!hotbar.includes(result)) {
      for (let i = 0; i < hotbar.length; i++) {
        if (hotbar[i] === AIR || hotbar[i] === GRASS || hotbar[i] === DIRT || hotbar[i] === SAND) {
          hotbar[i] = result;
          break;
        }
      }
    }

    const msg = `\uD83D\uDD28 合成成功! 獲得 ${this.currentRecipe.name} x${this.currentRecipe.count}`;
    this.currentRecipe = null;
    this.checkRecipe();
    return { success: true, message: msg };
  }

  /** Auto-craft: find first craftable recipe */
  autoCraft(inventory: Record<number, number>, hotbar: number[]): { success: boolean; message: string } {
    // Clear grid first
    for (let i = 0; i < 9; i++) {
      if (this.grid[i] > 0) {
        inventory[this.grid[i]] = (inventory[this.grid[i]] || 0) + 1;
        this.grid[i] = 0;
      }
    }

    for (const recipe of RECIPES) {
      if (this.canCraftRecipe(recipe, inventory)) {
        // Consume materials
        for (let i = 0; i < 9; i++) {
          if (recipe.grid[i] !== 0) {
            this.grid[i] = recipe.grid[i];
            inventory[recipe.grid[i]]--;
            if (inventory[recipe.grid[i]] <= 0) delete inventory[recipe.grid[i]];
          }
        }

        // Add result
        inventory[recipe.result] = (inventory[recipe.result] || 0) + recipe.count;

        // Auto-add to hotbar
        if (!hotbar.includes(recipe.result)) {
          for (let i = 0; i < hotbar.length; i++) {
            if (hotbar[i] === AIR || hotbar[i] === GRASS || hotbar[i] === DIRT || hotbar[i] === SAND) {
              hotbar[i] = recipe.result;
              break;
            }
          }
        }

        this.currentRecipe = null;
        this.checkRecipe();
        return { success: true, message: `\u26A1 一鍵合成成功! 獲得 ${recipe.name} x${recipe.count}` };
      }
    }

    return { success: false, message: '\u274C 背包中沒有足夠材料合成任何物品' };
  }

  /** Check if a specific recipe can be crafted */
  canCraftRecipe(recipe: Recipe, inventory: Record<number, number>): boolean {
    const needed: Record<number, number> = {};
    for (let i = 0; i < 9; i++) {
      if (recipe.grid[i] !== 0) {
        needed[recipe.grid[i]] = (needed[recipe.grid[i]] || 0) + 1;
      }
    }
    for (const [mat, count] of Object.entries(needed)) {
      if ((inventory[parseInt(mat)] || 0) < count) return false;
    }
    return true;
  }

  /** Clear grid and return items */
  clear(inventory: Record<number, number>): void {
    for (let i = 0; i < 9; i++) {
      if (this.grid[i] > 0) {
        inventory[this.grid[i]] = (inventory[this.grid[i]] || 0) + 1;
        this.grid[i] = 0;
      }
    }
    this.selectedItem = null;
    this.currentRecipe = null;
  }

  /** Get list of craftable recipes */
  getCraftableRecipes(inventory: Record<number, number>): Array<{ recipe: Recipe; canCraft: boolean }> {
    return RECIPES.map((recipe) => ({
      recipe,
      canCraft: this.canCraftRecipe(recipe, inventory),
    }));
  }
}
