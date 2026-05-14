import { LevelConfig, VillainSize } from './gameTypes';

export const VILLAIN_WIDTHS: Record<VillainSize, number> = {
  small:  55,
  medium: 90,
  large: 130,
};

export const VILLAIN_ASPECT = 0.58;

export const HERO_BASE_WIDTH = 72;
export const HERO_ASPECT    = 0.575;
export const HERO_GROWTH    = 8;
export const EATS_PER_LEVEL = 10;

// small = fastest, medium = mid, large = slowest in every level.
// Speed trio: [small, medium, large] increases every level.
// Image index rotates across the 6 villain images for visual variety.
function lvl(
  level: number,
  onScreen: number,
  spawnMs: number,
  types: Array<[number, VillainSize, number]>,
): LevelConfig {
  return {
    level,
    villainsOnScreen: onScreen,
    spawnIntervalMs: spawnMs,
    villainTypes: types.map(([imageIndex, size, speed]) => ({ imageIndex, size, speed })),
  };
}

export const LEVELS: LevelConfig[] = [
  // ── Levels 1-5: slow, learn the game ─────────────────────────────────────
  lvl( 1, 5, 1400, [[0,'small',125], [1,'medium', 82], [2,'large', 52]]),
  lvl( 2, 6, 1300, [[1,'small',138], [2,'medium', 92], [3,'large', 58]]),
  lvl( 3, 6, 1200, [[2,'small',152], [3,'medium',102], [4,'large', 65]]),
  lvl( 4, 7, 1100, [[3,'small',165], [4,'medium',112], [5,'large', 72]]),
  lvl( 5, 7, 1050, [[4,'small',178], [5,'medium',122], [0,'large', 79]]),
  // ── Levels 6-10: medium pace ──────────────────────────────────────────────
  lvl( 6, 8,  980, [[5,'small',192], [0,'medium',134], [1,'large', 87]]),
  lvl( 7, 8,  930, [[0,'small',206], [1,'medium',146], [2,'large', 95]]),
  lvl( 8, 9,  880, [[1,'small',220], [2,'medium',158], [3,'large',103]]),
  lvl( 9, 9,  830, [[2,'small',234], [3,'medium',170], [4,'large',111]]),
  lvl(10, 10, 780, [[3,'small',248], [4,'medium',182], [5,'large',119]]),
  // ── Levels 11-15: fast, multiple types ───────────────────────────────────
  lvl(11, 10, 730, [[4,'small',265], [5,'medium',196], [0,'large',128], [1,'medium',175]]),
  lvl(12, 11, 680, [[5,'small',282], [0,'medium',210], [1,'large',137], [2,'small',255]]),
  lvl(13, 11, 640, [[0,'small',299], [1,'medium',224], [2,'large',147], [3,'medium',205]]),
  lvl(14, 12, 600, [[1,'small',316], [2,'medium',238], [3,'large',157], [4,'small',290]]),
  lvl(15, 12, 570, [[2,'small',333], [3,'medium',252], [4,'large',167], [5,'medium',230]]),
  // ── Levels 16-20: hectic ─────────────────────────────────────────────────
  lvl(16, 13, 540, [[3,'small',352], [4,'medium',268], [5,'large',178], [0,'small',310]]),
  lvl(17, 13, 510, [[4,'small',371], [5,'medium',284], [0,'large',189], [1,'medium',260]]),
  lvl(18, 14, 480, [[5,'small',390], [0,'medium',300], [1,'large',200], [2,'small',345]]),
  lvl(19, 14, 460, [[0,'small',410], [1,'medium',316], [2,'large',212], [3,'small',370]]),
  lvl(20, 15, 440, [[1,'small',430], [2,'medium',332], [3,'large',224], [4,'small',390], [5,'medium',305]]),
];
