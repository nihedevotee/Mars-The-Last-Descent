import { EQUIPMENT_DEFINITIONS, SHIP_PARTS, EquipmentDefinition } from './equipment';
import { SCIENCE_SAMPLES } from './samples';
import { LANDMARK_DEFINITIONS } from './landmarks';
import { MOON_RELICS, MOON_MONUMENTS, MOON_ROCKS, MOON_SECRETS, MOON_ICE_DEPOSITS } from './moonMap';
import { GAME_CONSTANTS } from './gameFacts';

export type NovaEventType =
  | 'part_salvaged'
  | 'sample_collected'
  | 'landmark_discovered'
  | 'depth_sounder'
  | 'sonar_ping'
  | 'pet_nova'
  | 'upgrade_bought'
  | 'bonus_rp'
  | 'ship_repaired'
  | 'moon_relic'
  | 'moon_ice'
  | 'moon_monument'
  | 'moon_rock'
  | 'moon_secret'
  | 'moon_thumper'
  | 'moon_lrv';

export interface NovaEvent {
  atPlaySeconds: number;
  type: NovaEventType;
  detail?: string;
}

export interface MarsGameContext {
  location: 'mars';
  solNumber: number;
  clock: string;
  isNight: boolean;
  biome?: 'rocky' | 'desert' | 'snow' | 'grassland';
  collectedPartIds: string[];
  completedEquipmentIds: string[];
  collectedSampleIds: string[];
  discoveredLandmarkIds: string[];
  canyonSounded: boolean;
  researchPoints: number;
  upgrades: { jetpack: number; scan: number; minimap: number };
  sprintEnergy: number;
  sonarCooldownS: number;
  moraleBoostS: number;
  isShipRepaired: boolean;
  nearObjectName?: string;
}

export interface MoonGameContext {
  location: 'moon';
  relicIds: string[];
  monumentIds: string[];
  lunarRockIds: string[];
  iceScannedIds: string[];
  secretIds: string[];
  thumperFired: boolean;
  ridingLrv: boolean;
  chapterCompleted: boolean;
}

export type NovaGameContext = MarsGameContext | MoonGameContext;

const MAX_NOVA_EVENTS = 20;
const eventRingBuffer: NovaEvent[] = [];

export function pushNovaEvent(e: NovaEvent): void {
  eventRingBuffer.push({
    atPlaySeconds: Math.max(0, Math.floor(e.atPlaySeconds)),
    type: e.type,
    detail: e.detail,
  });
  if (eventRingBuffer.length > MAX_NOVA_EVENTS) {
    eventRingBuffer.splice(0, eventRingBuffer.length - MAX_NOVA_EVENTS);
  }
}

export function getRecentNovaEvents(n = 5): NovaEvent[] {
  if (n <= 0) return [];
  return eventRingBuffer.slice(-n);
}

export function clearNovaEvents(): void {
  eventRingBuffer.length = 0;
}

export function getMissingEquipment(ctx: MarsGameContext): EquipmentDefinition[] {
  const allEquip = Object.values(EQUIPMENT_DEFINITIONS);
  return allEquip.filter(
    (eq) =>
      !ctx.collectedPartIds.includes(eq.rewardPartId) &&
      !ctx.completedEquipmentIds.includes(eq.id),
  );
}

export interface AffordableUpgradeOption {
  key: 'jetpack' | 'scan' | 'minimap';
  label: string;
  nextLevel: number;
  cost: number;
}

const UPGRADE_LABELS: Record<'jetpack' | 'scan' | 'minimap', string> = {
  jetpack: 'Jetpack',
  scan: 'Scan',
  minimap: 'Minimap',
};

export function getCheapestAffordableUpgrade(ctx: MarsGameContext): AffordableUpgradeOption | null {
  const keys: Array<'jetpack' | 'scan' | 'minimap'> = ['jetpack', 'scan', 'minimap'];
  const affordable: AffordableUpgradeOption[] = [];

  for (const key of keys) {
    const currentLvl = ctx.upgrades[key] || 0;
    if (currentLvl >= 2) continue;
    const cost = GAME_CONSTANTS.UPGRADE_COST[key][currentLvl];
    if (ctx.researchPoints >= cost) {
      affordable.push({
        key,
        label: UPGRADE_LABELS[key],
        nextLevel: currentLvl + 1,
        cost,
      });
    }
  }

  if (affordable.length === 0) return null;
  affordable.sort((a, b) => a.cost - b.cost);
  return affordable[0];
}

function formatEventClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatSingleEvent(e: NovaEvent): string {
  const timePrefix = formatEventClock(e.atPlaySeconds);
  const suffix = e.detail ? ` ${e.detail}` : '';
  switch (e.type) {
    case 'part_salvaged':
      return `- ${timePrefix} salvaged${suffix}`;
    case 'sample_collected':
      return `- ${timePrefix} sampled${suffix}`;
    case 'landmark_discovered':
      return `- ${timePrefix} discovered landmark${suffix} (+${GAME_CONSTANTS.RP.LANDMARK} RP)`;
    case 'depth_sounder':
      return `- ${timePrefix} deployed Valles Marineris Depth Sounder (+${GAME_CONSTANTS.RP.DEPTH_SOUNDER} RP)`;
    case 'sonar_ping':
      return `- ${timePrefix} sonar ping${suffix}`;
    case 'pet_nova':
      return `- ${timePrefix} petted NOVA (+15% speed for ${GAME_CONSTANTS.PET.DURATION_S}s)`;
    case 'upgrade_bought':
      return `- ${timePrefix} bought upgrade${suffix}`;
    case 'bonus_rp':
      return `- ${timePrefix} earned 3-star bonus (+${GAME_CONSTANTS.RP.BONUS_3_STAR} RP)${suffix}`;
    case 'ship_repaired':
      return `- ${timePrefix} calibrated ship subsystems (READY FOR LAUNCH)`;
    case 'moon_relic':
      return `- ${timePrefix} logged lunar relic${suffix}`;
    case 'moon_ice':
      return `- ${timePrefix} scanned lunar water ice${suffix}`;
    case 'moon_monument':
      return `- ${timePrefix} inspected lunar monument${suffix}`;
    case 'moon_rock':
      return `- ${timePrefix} sampled lunar rock${suffix}`;
    case 'moon_secret':
      return `- ${timePrefix} uncovered lunar secret${suffix}`;
    case 'moon_thumper':
      return `- ${timePrefix} fired ALSEP seismic thumper`;
    case 'moon_lrv':
      return `- ${timePrefix} boarded Apollo LRV`;
    default:
      return `- ${timePrefix} ${e.type}${suffix}`;
  }
}

export function formatRecentEventsBlock(n = 5): string {
  const events = getRecentNovaEvents(n);
  if (events.length === 0) return '- none yet';
  return events.map(formatSingleEvent).join('\n');
}

export function formatGameStateBlock(ctx: NovaGameContext): string {
  if (ctx.location === 'moon') {
    const relicNames = ctx.relicIds
      .map((id) => MOON_RELICS.find((r) => r.id === id)?.name || id)
      .join(', ');
    const monumentNames = ctx.monumentIds
      .map((id) => MOON_MONUMENTS.find((m) => m.id === id)?.name || id)
      .join(', ');
    const rockNames = ctx.lunarRockIds
      .map((id) => MOON_ROCKS.find((r) => r.id === id)?.name || id)
      .join(', ');
    const secretNames = ctx.secretIds
      .map((id) => MOON_SECRETS.find((s) => s.id === id)?.name || id)
      .join(', ');

    return [
      `location: moon_prequel`,
      `relics: ${ctx.relicIds.length}/${MOON_RELICS.length}${relicNames ? ` = ${relicNames}` : ''}`,
      `monuments: ${ctx.monumentIds.length}/${MOON_MONUMENTS.length}${monumentNames ? ` = ${monumentNames}` : ''}`,
      `rocks: ${ctx.lunarRockIds.length}/${MOON_ROCKS.length}${rockNames ? ` = ${rockNames}` : ''}`,
      `ice: ${ctx.iceScannedIds.length}/${MOON_ICE_DEPOSITS.length}`,
      `secrets: ${ctx.secretIds.length}/${MOON_SECRETS.length}${secretNames ? ` = ${secretNames}` : ''}`,
      `thumper_fired: ${ctx.thumperFired}`,
      `riding_lrv: ${ctx.ridingLrv}`,
      `chapter_completed: ${ctx.chapterCompleted}`,
    ].join('\n');
  }

  const collectedPartNames = ctx.collectedPartIds.map((id) => SHIP_PARTS[id]?.name || id);
  const missingEquip = getMissingEquipment(ctx);
  const missingList = missingEquip.map(
    (eq) => `${SHIP_PARTS[eq.rewardPartId]?.name || eq.rewardPartId} (${eq.name})`,
  );
  const sampleNames = ctx.collectedSampleIds.map((id) => SCIENCE_SAMPLES[id]?.name || id);
  const landmarkNames = ctx.discoveredLandmarkIds.map((id) => LANDMARK_DEFINITIONS[id]?.name || id);

  return [
    `location: mars_open_world`,
    `in_game_time: Sol ${ctx.solNumber}, ${ctx.clock} (${ctx.isNight ? 'night' : 'day'})`,
    `biome_under_player: ${ctx.biome || 'unknown'}`,
    `parts: ${ctx.collectedPartIds.length}/${GAME_CONSTANTS.PARTS_REQUIRED} collected = ${collectedPartNames.length > 0 ? collectedPartNames.join(', ') : 'none'}`,
    `missing_parts: ${missingList.length > 0 ? missingList.join(', ') : 'none'}`,
    `samples: ${ctx.collectedSampleIds.length}/${Object.keys(SCIENCE_SAMPLES).length} = ${sampleNames.length > 0 ? sampleNames.join(', ') : 'none'}`,
    `landmarks: ${ctx.discoveredLandmarkIds.length}/${Object.keys(LANDMARK_DEFINITIONS).length} discovered = ${landmarkNames.length > 0 ? landmarkNames.join(', ') : 'none'}; depth_sounder_used: ${ctx.canyonSounded}`,
    `research_points: ${ctx.researchPoints}`,
    `upgrades: jetpack L${ctx.upgrades.jetpack}, scan L${ctx.upgrades.scan}, minimap L${ctx.upgrades.minimap}`,
    `jetpack_energy: ${Math.round(ctx.sprintEnergy)}/${GAME_CONSTANTS.SPRINT.MAX}`,
    `sonar: ${ctx.sonarCooldownS <= 0 ? 'ready' : `cooldown ${ctx.sonarCooldownS.toFixed(1)}s`}`,
    `morale_boost: ${ctx.moraleBoostS > 0 ? `active (${ctx.moraleBoostS.toFixed(1)}s left)` : 'inactive'}`,
    `ship_repaired: ${ctx.isShipRepaired}`,
    `near_object: ${ctx.nearObjectName || 'none'}`,
  ].join('\n');
}

export function computeNextStep(ctx: NovaGameContext): string {
  if (ctx.location === 'moon') {
    if (ctx.chapterCompleted) {
      return 'Chapter complete: continue to Mars.';
    }

    const remainingRelics = MOON_RELICS.filter((r) => !ctx.relicIds.includes(r.id));
    if (remainingRelics.length > 0) {
      const optionalLeft: string[] = [];
      if (ctx.iceScannedIds.length < MOON_ICE_DEPOSITS.length) {
        optionalLeft.push(`${MOON_ICE_DEPOSITS.length - ctx.iceScannedIds.length} PSR water-ice spots`);
      }
      if (ctx.lunarRockIds.length < MOON_ROCKS.length) {
        optionalLeft.push(`${MOON_ROCKS.length - ctx.lunarRockIds.length} lunar rocks`);
      }
      if (ctx.secretIds.length < MOON_SECRETS.length) {
        optionalLeft.push(`${MOON_SECRETS.length - ctx.secretIds.length} secrets`);
      }
      if (!ctx.thumperFired) {
        optionalLeft.push('ALSEP seismic thumper');
      }
      const optionalNote = optionalLeft.length > 0 ? ` Optional surveys left: ${optionalLeft.join(', ')}.` : '';
      return `Survey remaining historic relics (${remainingRelics.length}/3 left; next: ${remainingRelics[0].name}).${optionalNote}`;
    }

    return 'All 3 relics logged: observe Earthrise ahead to continue to Mars.';
  }

  if (ctx.isShipRepaired) {
    return 'Ship repaired: complete the launch sequence to depart Mars.';
  }

  if (ctx.collectedPartIds.length >= GAME_CONSTANTS.PARTS_REQUIRED) {
    return 'All 8 parts found: return to the crashed ship and calibrate the 3 subsystems (gimbal 0 deg, power bus 60 Hz, gyro trim 0).';
  }

  const missing = getMissingEquipment(ctx);
  const remainingCount = Math.max(0, GAME_CONSTANTS.PARTS_REQUIRED - ctx.collectedPartIds.length);
  const nextWreck = missing[0]?.name || 'nearby historic wreck';
  const cheapestUpgrade = ctx.collectedPartIds.length >= 1 ? getCheapestAffordableUpgrade(ctx) : null;

  if (cheapestUpgrade) {
    return `You have ${ctx.researchPoints} RP: ${cheapestUpgrade.label} L${cheapestUpgrade.nextLevel} costs ${cheapestUpgrade.cost} RP and is optional at the ship. Otherwise use Sonar [Q]; ${remainingCount} parts remain (next wreck: ${nextWreck}).`;
  }

  return `Use Sonar [Q]; ${remainingCount} parts remain (next wreck: ${nextWreck}).`;
}
