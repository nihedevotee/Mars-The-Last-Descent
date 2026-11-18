export const GAME_CONSTANTS = {
  TILE_PX: 16,
  WALK_SPEED: 75,
  SPRINT_MULT: 1.6,
  BIOME_SPEED: { rocky: 1, grassland: 1, desert: 0.92, snow: 0.88 },
  SPRINT: { MAX: 100, MIN_TO_START: 5, REGEN_PER_S: 20, DRAIN_PER_S: [28, 20, 14] as const },
  SONAR: {
    COOLDOWN_S: 5.0,
    RADIUS_PX: [280, 350, 420] as const,
    MINIMAP_REVEAL_TILES: [18, 22, 26] as const,
    PING_REVEAL_BONUS_TILES: 8,
  },
  PET: { RANGE_PX: 45, DURATION_S: 6.0, SPEED_MULT: 1.15 },
  SOL: { REAL_SECONDS: 180, NIGHT_AFTER: 0.75, NIGHT_BEFORE: 0.22, START: 0.35 },
  UPGRADE_COST: { jetpack: [3, 6], scan: [4, 8], minimap: [5, 10] } as const,
  RP: { LANDMARK: 1, DEPTH_SOUNDER: 3, BONUS_3_STAR: 1, MOON_CARRYOVER_CAP: 4 },
  CALIBRATION: {
    gimbal: { target: 0, tolerance: 2, start: 12 },
    powerBusHz: { min: 58, max: 62, target: 60, start: 30 },
    gyroTrim: { target: 0, tolerance: 1, start: -15 },
  },
  MOON: { HOP_MULT: 1.4, HOP_AIRTIME_S: 0.8, HOP_COOLDOWN_S: 0.4 },
  PARTS_REQUIRED: 8,
} as const;

export interface MinigameHowto {
  goal: string;
  controls: string;
  realHistory: string;
}

export const MINIGAME_HOWTO: Record<string, MinigameHowto> = {
  eq_sojourner: {
    goal: 'Program a command sequence and run it to reach the rock "Yogi".',
    controls: 'forward [W/Up/Space], turn left [A/Left], turn right [D/Right], undo [Backspace/Z], then run the sequence.',
    realHistory: 'Real: first wheeled rover on Mars (Pathfinder & Sojourner, 1997, Ares Vallis).',
  },
  eq_opportunity: {
    goal: 'Abrade the sulfate outcrop and zap the hematite "blueberries".',
    controls: 'Interactive outcrop abrasion and zap controls on screen.',
    realHistory: 'Real: confirmed past standing and ground water; ran 14 years (Opportunity, 2004-2018, Meridiani Planum).',
  },
  eq_insight: {
    goal: 'Tune out wind vibration on the seismometer.',
    controls: 'Adjust frequency tuning with [A/D] or Left/Right arrow keys.',
    realHistory: 'Real: found a liquid core, measured over 1,300 marsquakes (InSight, 2018-2022, Elysium Planitia).',
  },
  eq_spirit: {
    goal: 'Counter-steer the locked, dragged wheel to stay on the silica vein.',
    controls: 'Counter-steer with [A/D].',
    realHistory: 'Real: found silica-rich deposits pointing to hot-spring/steam environments before getting stuck in sand (Spirit, 2004-2010, Gusev Crater).',
  },
  eq_deep_space_dish: {
    goal: 'Move the mirror to bounce 5 blue beams into the feed horn; dodge red solar flares.',
    controls: 'Move mirror with [A/D], arrows, or drag/tap.',
    realHistory: 'Real: 70 m-class dishes link craft to Earth. Active, on Earth (Deep Space Network, 1963-present).',
  },
  eq_phoenix: {
    goal: 'Dig down to the subsurface ice, then bag chunks before they sublimate.',
    controls: 'Dig down [S/Down], rise slower [W/Up], move sideways [A/D], bag ice with [Space/E].',
    realHistory: 'Real: directly saw subsurface water ice (Phoenix, 2008, Vastitas Borealis).',
  },
  eq_lrv_buggy: {
    goal: 'Drive the buggy across lunar craters and collect 4 sample crates.',
    controls: 'Throttle [W/Up], steer left/right, jump craters [Space/Shift].',
    realHistory: 'Real: extended astronaut range from about 1 km to over 7 km (Apollo LRV, 1971-1972, Taurus-Littrow). It is on the Moon.',
  },
  eq_surveyor: {
    goal: 'Catch floating samples with the hopper and build combos.',
    controls: 'Move hopper [A/D], launch/jump [Space/Up/W].',
    realHistory: 'Real: the only robotic craft on another world visited by humans (Surveyor 3, 1967-1969, Oceanus Procellarum; visited by Apollo 12). It is on the Moon.',
  },
};
