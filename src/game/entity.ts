// ============================================================
// Entity Module - Base Entity Class, Mob AI, Projectiles
// ============================================================

import { JUMP, TS, WATER, WH, WW, GRAV, getEntityLoot } from './constants';
import { getBlock } from './world';
import { isSolid } from './constants';
import type { EntityState, EntityType, ProjectileType } from '@/types/game';
import { wrapRenderX } from './camera';

// ─── Entity Class ───────────────────────────────────────────
export class Entity {
  x: number;
  y: number;
  type: EntityType;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  dead: boolean;
  face: number;
  anim: number;
  state: EntityState;
  attackCD: number;
  target: Entity | null;
  onGround: boolean;

  constructor(x: number, y: number, type: EntityType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.vx = 0;
    this.vy = 0;
    this.w = TS * 0.8;
    this.h = TS * 0.8;
    this.hp = 10;
    this.maxHp = 10;
    this.dead = false;
    this.face = 1;
    this.anim = 0;
    this.state = 'idle';
    this.attackCD = 0;
    this.target = null;
    this.onGround = false;
  }

  /** Check collision with world blocks */
  checkCollision(): void {
    const x0 = Math.floor(this.x / TS);
    const x1 = Math.floor((this.x + this.w - 0.1) / TS);
    const y0 = Math.floor(this.y / TS);
    const y1 = Math.floor((this.y + this.h - 0.1) / TS);

    // Ground check
    if (isSolid(getBlock(x0, y1 + 1)) || isSolid(getBlock(x1, y1 + 1))) {
      this.onGround = true;
      this.y = (y1 + 1) * TS - this.h - 0.01;
      this.vy = 0;
    } else {
      this.onGround = false;
    }

    // Ceiling check
    if (isSolid(getBlock(x0, y0)) || isSolid(getBlock(x1, y0))) {
      this.y = (y0 + 1) * TS + 0.01;
      this.vy = 0;
    }

    // Right wall
    if (this.vx > 0) {
      if (isSolid(getBlock(x1 + 1, y0)) || isSolid(getBlock(x1 + 1, y1))) {
        this.x = (x1 + 1) * TS - this.w - 0.01;
        this.vx = 0;
      }
    }
    // Left wall
    if (this.vx < 0) {
      if (isSolid(getBlock(x0 - 1, y0)) || isSolid(getBlock(x0 - 1, y1))) {
        this.x = x0 * TS + 0.01;
        this.vx = 0;
      }
    }

    // World bounds
    this.x = Math.max(0, Math.min(WW * TS - this.w, this.x));
    this.y = Math.max(0, Math.min(WH * TS - this.h, this.y));
  }

  /** Update entity AI and physics */
  update(playerX: number, playerY: number, isNight: boolean, onPlayerHit: (dmg: number, source: string) => void, spawnProjectile: (x: number, y: number, vx: number, vy: number, type: ProjectileType, dmg: number) => void): void {
    if (this.dead) return;
    this.anim++;
    if (this.attackCD > 0) this.attackCD--;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (this.type === 'zombie' || this.type === 'skeleton') {
      this.updateHostile(dx, dy, dist, isNight, onPlayerHit, spawnProjectile);
    } else if (this.type === 'pig' || this.type === 'cow' || this.type === 'chicken') {
      this.updatePassive(dx, dist);
    } else if (this.type === 'fish') {
      this.updateFish();
    }

    // Apply gravity (reduced for entities)
    this.vy += GRAV * 0.5;
    if (this.vy > 12) this.vy = 12;

    this.x += this.vx;
    this.y += this.vy;

    this.checkCollision();
  }

  private updateHostile(dx: number, dy: number, dist: number, night: boolean, onPlayerHit: (dmg: number, source: string) => void, spawnProjectile: (x: number, y: number, vx: number, vy: number, type: ProjectileType, dmg: number) => void): void {
    // Burn in daylight
    if (!night) {
      this.hp -= 0.5;
      if (this.hp <= 0) {
        this.dead = true;
        return;
      }
      this.state = 'idle';
      this.vx *= 0.8;
      this.vy += GRAV * 0.5;
      this.y += this.vy;
      this.checkCollision();
      return;
    }

    if (dist < 15 * TS && dist > TS * 0.8) {
      // Chase player
      this.state = 'chase';
      this.face = dx > 0 ? 1 : -1;
      this.vx = this.face * (this.type === 'zombie' ? 2.0 : 1.8);

      // Jump over obstacles
      const tx = Math.floor((this.x + this.face * this.w) / TS);
      const ty = Math.floor(this.y / TS);
      const ty2 = Math.floor((this.y + this.h * 0.5) / TS);
      if (isSolid(getBlock(tx, ty)) || isSolid(getBlock(tx, ty2))) {
        if (this.onGround) this.vy = JUMP * 0.7;
      }
    } else if (dist <= TS * 1.2 && this.attackCD <= 0) {
      // Attack
      this.state = 'attack';
      this.attackCD = 35;

      if (this.type === 'skeleton') {
        // Shoot arrow
        const angle = Math.atan2(dy, dx);
        spawnProjectile(
          this.x + this.w / 2,
          this.y + this.h / 2,
          Math.cos(angle) * 6,
          Math.sin(angle) * 6,
          'skeleton_arrow',
          3
        );
      } else {
        // Melee attack
        onPlayerHit(4, '被殭屍咬死了');
      }
    } else {
      this.state = 'idle';
      this.vx *= 0.8;
    }
  }

  private updatePassive(dx: number, dist: number): void {
    // Random movement
    if (Math.random() < 0.02) {
      this.face = Math.random() > 0.5 ? 1 : -1;
      this.vx = this.face * (this.type === 'chicken' ? 1.5 : 0.8);
    }
    // Random hop
    if (Math.random() < 0.01 && this.onGround) {
      this.vy = JUMP * 0.5;
    }
    // Flee from player
    if (dist < 6 * TS) {
      this.face = dx > 0 ? -1 : 1;
      this.vx = this.face * 3.0;
    }
  }

  private updateFish(): void {
    if (Math.random() < 0.05) {
      this.vx = (Math.random() - 0.5) * 2.5;
      this.vy = (Math.random() - 0.5) * 1.5;
    }
    const tx = Math.floor(this.x / TS);
    const ty = Math.floor(this.y / TS);
    if (getBlock(tx, ty) !== WATER) {
      this.vy = -1.5;
      this.vx *= 0.5;
    }
  }

  /** Draw entity on canvas */
  draw(cx: CanvasRenderingContext2D, renderCamX: number, camY: number, viewW: number, viewH: number): void {
    if (this.dead) return;
    const rx = wrapRenderX(this.x, renderCamX);
    const sx = Math.round(rx - renderCamX);
    const sy = Math.round(this.y - camY);
    if (sx < -50 || sx > viewW + 50 || sy < -50 || sy > viewH + 50) return;

    cx.save();
    cx.translate(sx + this.w / 2, sy + this.h / 2);
    if (this.face < 0) cx.scale(-1, 1);

    switch (this.type) {
      case 'zombie':
        this.drawZombie(cx);
        break;
      case 'skeleton':
        this.drawSkeleton(cx);
        break;
      case 'pig':
        this.drawPig(cx);
        break;
      case 'cow':
        this.drawCow(cx);
        break;
      case 'chicken':
        this.drawChicken(cx);
        break;
      case 'fish':
        this.drawFish(cx);
        break;
    }

    // Health bar
    if (this.hp < this.maxHp) {
      cx.fillStyle = '#333';
      cx.fillRect(-this.w / 2, -this.h / 2 - 10, this.w, 4);
      cx.fillStyle = '#e74c3c';
      cx.fillRect(-this.w / 2, -this.h / 2 - 10, this.w * (this.hp / this.maxHp), 4);
    }

    cx.restore();
  }

  private drawZombie(cx: CanvasRenderingContext2D): void {
    cx.fillStyle = '#2d5a1a';
    cx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    cx.fillStyle = '#1a3a0a';
    cx.fillRect(-this.w / 2 + 2, -this.h / 2 + 2, this.w - 4, this.h * 0.3);
    cx.fillStyle = '#ff0000';
    cx.fillRect(-this.w / 4, -this.h / 3, 4, 4);
    cx.fillRect(this.w / 8, -this.h / 3, 4, 4);
    const armSwing = Math.sin(this.anim * 0.1) * 5;
    cx.fillStyle = '#2d5a1a';
    cx.fillRect(-this.w / 2 - 4, -this.h / 4 + armSwing, 6, this.h * 0.4);
    cx.fillRect(this.w / 2 - 2, -this.h / 4 - armSwing, 6, this.h * 0.4);
    if (this.state === 'attack') {
      cx.fillStyle = '#3a6a2a';
      cx.fillRect(this.w / 2, -this.h / 4, 12, 6);
    }
  }

  private drawSkeleton(cx: CanvasRenderingContext2D): void {
    cx.fillStyle = '#e8e0d0';
    cx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    cx.fillStyle = '#f0e8d8';
    cx.fillRect(-this.w / 2 + 2, -this.h / 2 + 2, this.w - 4, this.h * 0.35);
    cx.fillStyle = '#1a1a1a';
    cx.fillRect(-this.w / 4, -this.h / 3, 5, 5);
    cx.fillRect(this.w / 8, -this.h / 3, 5, 5);
    cx.strokeStyle = '#8B4513';
    cx.lineWidth = 2;
    cx.beginPath();
    cx.arc(this.w / 2, -this.h / 4, 8, -Math.PI / 2, Math.PI / 2);
    cx.stroke();
    cx.strokeStyle = '#888';
    cx.beginPath();
    cx.moveTo(this.w / 2 + 5, -this.h / 4 - 5);
    cx.lineTo(this.w / 2 + 15, -this.h / 4);
    cx.lineTo(this.w / 2 + 5, -this.h / 4 + 5);
    cx.stroke();
  }

  private drawPig(cx: CanvasRenderingContext2D): void {
    cx.fillStyle = '#f4a4a4';
    cx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h * 0.7);
    cx.fillRect(-this.w / 2, -this.h / 2 - 4, this.w * 0.5, this.h * 0.4);
    cx.fillStyle = '#e08080';
    cx.fillRect(-this.w / 2 - 2, -this.h / 3, 6, 6);
    cx.fillStyle = '#1a1a1a';
    cx.fillRect(-this.w / 4, -this.h / 2 - 2, 3, 3);
    const legSwing = Math.sin(this.anim * 0.15) * 3;
    cx.fillStyle = '#f4a4a4';
    cx.fillRect(-this.w / 3, this.h * 0.2 + legSwing, 5, this.h * 0.3);
    cx.fillRect(this.w / 6, this.h * 0.2 - legSwing, 5, this.h * 0.3);
  }

  private drawCow(cx: CanvasRenderingContext2D): void {
    cx.fillStyle = '#8B4513';
    cx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h * 0.7);
    cx.fillStyle = '#f5f5dc';
    cx.fillRect(-this.w / 4, -this.h / 4, this.w * 0.3, this.h * 0.25);
    cx.fillRect(this.w / 6, -this.h / 6, this.w * 0.2, this.h * 0.2);
    cx.fillStyle = '#8B4513';
    cx.fillRect(-this.w / 2, -this.h / 2 - 6, this.w * 0.45, this.h * 0.45);
    cx.fillStyle = '#ddd';
    cx.fillRect(-this.w / 2 - 3, -this.h / 2 - 8, 4, 6);
    cx.fillStyle = '#1a1a1a';
    cx.fillRect(-this.w / 4, -this.h / 2 - 2, 3, 3);
    const legSwing = Math.sin(this.anim * 0.1) * 2;
    cx.fillStyle = '#8B4513';
    cx.fillRect(-this.w / 3, this.h * 0.2 + legSwing, 5, this.h * 0.3);
    cx.fillRect(this.w / 6, this.h * 0.2 - legSwing, 5, this.h * 0.3);
  }

  private drawChicken(cx: CanvasRenderingContext2D): void {
    cx.fillStyle = '#fff';
    cx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h * 0.6);
    cx.fillRect(-this.w / 2, -this.h / 2 - 6, this.w * 0.35, this.h * 0.35);
    cx.fillStyle = '#ff0000';
    cx.fillRect(-this.w / 2 + 2, -this.h / 2 - 10, 6, 4);
    cx.fillStyle = '#ffaa00';
    cx.fillRect(-this.w / 2 - 4, -this.h / 3, 5, 4);
    cx.fillStyle = '#1a1a1a';
    cx.fillRect(-this.w / 4, -this.h / 2 - 2, 2, 2);
    const wingFlap = Math.sin(this.anim * 0.3) * 8;
    cx.fillStyle = '#f0f0f0';
    cx.fillRect(-this.w / 2 - 3, -this.h / 4 + wingFlap, 4, this.h * 0.25);
    cx.fillStyle = '#ffaa00';
    cx.fillRect(-this.w / 4, this.h * 0.1, 3, this.h * 0.3);
  }

  private drawFish(cx: CanvasRenderingContext2D): void {
    cx.fillStyle = '#4a90d9';
    cx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h * 0.5);
    const tailWag = Math.sin(this.anim * 0.2) * 4;
    cx.fillRect(this.w / 2 - 2, -this.h / 4 + tailWag, 6, this.h * 0.3);
    cx.fillStyle = '#1a1a1a';
    cx.fillRect(-this.w / 3, -this.h / 3, 3, 3);
    cx.fillStyle = '#3a80c9';
    cx.fillRect(-this.w / 4, -this.h / 2 - 2, 4, 3);
  }

  /** Apply damage to entity */
  takeDamage(dmg: number): void {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  /** Get loot drops */
  getLoot(): Array<{ item: number; count: number }> {
    const loot: Array<{ item: number; count: number }> = [];
    const lootTable = getEntityLoot(this.type);
    for (const entry of lootTable) {
      let count = entry.count;
      if (entry.chance && Math.random() > entry.chance) {
        count = entry.count === 2 ? 1 : 0;
      }
      if (count > 0) {
        loot.push({ item: entry.item, count });
      }
    }
    return loot;
  }
}

// ─── Projectile Class ───────────────────────────────────────
export class Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: ProjectileType;
  dmg: number;
  life: number;
  dead: boolean;

  constructor(x: number, y: number, vx: number, vy: number, type: ProjectileType, dmg: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.dmg = dmg;
    this.life = 120;
    this.dead = false;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.dead = true;

    const tx = Math.floor(this.x / TS);
    const ty = Math.floor(this.y / TS);
    if (isSolid(getBlock(tx, ty))) this.dead = true;
  }

  draw(cx: CanvasRenderingContext2D, renderCamX: number, camY: number, viewW: number): void {
    if (this.dead) return;
    const rx = wrapRenderX(this.x, renderCamX);
    const sx = Math.round(rx - renderCamX);
    const sy = Math.round(this.y - camY);
    if (sx < -20 || sx > viewW + 20) return;

    cx.save();
    cx.translate(sx, sy);
    cx.rotate(Math.atan2(this.vy, this.vx));
    cx.fillStyle = this.type === 'skeleton_arrow' ? '#888' : '#4a90d9';
    cx.fillRect(-8, -1, 16, 2);
    cx.fillStyle = this.type === 'skeleton_arrow' ? '#aaa' : '#6ab0f9';
    cx.fillRect(4, -3, 4, 6);
    cx.restore();
  }
}
