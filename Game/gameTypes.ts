export type VillainSize = 'small' | 'medium' | 'large';
export type ScreenName = 'heroSelect' | 'playing' | 'levelComplete' | 'gameOver';

export interface VillainTypeConfig {
  imageIndex: number;
  size: VillainSize;
  speed: number; // px per second
}

export interface LevelConfig {
  level: number;
  villainsOnScreen: number;
  villainTypes: VillainTypeConfig[];
  spawnIntervalMs: number;
}

export interface VillainState {
  id: number;
  x: number;
  y: number;
  imageIndex: number;
  size: VillainSize;
  speed: number;
  facingRight: boolean;
  width: number;
}

export interface EatingAnimState {
  id: number;
  x: number;
  y: number;
}
