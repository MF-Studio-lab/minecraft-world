// ============================================================
// Camera Module - Viewport tracking with smooth follow
// ============================================================

import { TS, WH, WW } from './constants';
import type { CameraState } from '@/types/game';

/** Create a new camera state */
export function createCamera(): CameraState {
  return {
    x: 0,
    y: 0,
    renderX: 0,
    lastRenderX: 0,
  };
}

/** Update camera position to smoothly follow target */
export function updateCamera(
  cam: CameraState,
  targetX: number,
  targetY: number,
  viewW: number,
  viewH: number
): void {
  const worldPx = WW * TS;

  // Choose the closest wrapped player position for smooth transition
  let playerCamX = targetX - viewW / 2;
  while (playerCamX - cam.x > worldPx / 2) playerCamX -= worldPx;
  while (cam.x - playerCamX > worldPx / 2) playerCamX += worldPx;

  const tcy = targetY - viewH / 2;

  // Smooth lerp
  cam.x += (playerCamX - cam.x) * 0.12;
  cam.y += (tcy - cam.y) * 0.12;
  cam.y = Math.max(0, Math.min(WH * TS - viewH, cam.y));

  // Choose render cam.x nearest to last render to avoid rapid wrap jitter
  cam.renderX = cam.x;
  while (Math.abs(cam.renderX - cam.lastRenderX) > worldPx / 2) {
    if (cam.renderX > cam.lastRenderX) cam.renderX -= worldPx;
    else cam.renderX += worldPx;
  }
  cam.lastRenderX = cam.renderX;
}

/** Get the wrapped render X for an entity (prevents pop at boundaries) */
export function wrapRenderX(x: number, renderCamX: number): number {
  const worldPx = WW * TS;
  let rx = x;
  while (rx - renderCamX > worldPx / 2) rx -= worldPx;
  while (renderCamX - rx > worldPx / 2) rx += worldPx;
  return rx;
}

/** Convert world X to screen X */
export function worldToScreenX(x: number, renderCamX: number): number {
  return Math.round(wrapRenderX(x, renderCamX) - renderCamX);
}

/** Convert world Y to screen Y */
export function worldToScreenY(y: number, camY: number): number {
  return Math.round(y - camY);
}

/** Get visible tile range */
export function getVisibleTiles(cam: CameraState, viewW: number, viewH: number): {
  sx0: number;
  sx1: number;
  sy0: number;
  sy1: number;
} {
  return {
    sx0: Math.floor(cam.renderX / TS) - 2,
    sx1: Math.ceil((cam.renderX + viewW) / TS) + 2,
    sy0: Math.floor(cam.y / TS) - 1,
    sy1: Math.ceil((cam.y + viewH) / TS) + 1,
  };
}
