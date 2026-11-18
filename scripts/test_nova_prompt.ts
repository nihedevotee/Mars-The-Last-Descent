import assert from 'node:assert/strict';
import {
  buildNovaSystemPrompt,
  getOfflineFallbackResponse,
  QUICK_CHIP_ANSWERS,
  getTelemetryAnswer,
} from '../src/data/novaKnowledge';
import { GAME_CONSTANTS } from '../src/data/gameFacts';
import { EQUIPMENT_DEFINITIONS, SHIP_PARTS } from '../src/data/equipment';
import {
  computeNextStep,
  clearNovaEvents,
  pushNovaEvent,
  MarsGameContext,
  MoonGameContext,
} from '../src/data/novaContext';
import {
  formatTelemetryForNova,
  MarsTelemetry,
} from '../src/services/nasaService';
import {
  buildConversationContents,
  sanitizeNovaReply,
  ChatMessage,
} from '../src/services/gemini';

function makeMarsCtx(overrides: Partial<MarsGameContext> = {}): MarsGameContext {
  return {
    location: 'mars',
    solNumber: 2,
    clock: '14:10',
    isNight: false,
    biome: 'desert',
    collectedPartIds: ['part_drive_motor', 'part_solar_bus', 'part_inertial_gyro'],
    completedEquipmentIds: ['eq_sojourner', 'eq_opportunity', 'eq_insight'],
    collectedSampleIds: ['sample_basalt'],
    discoveredLandmarkIds: ['canyon_rim'],
    canyonSounded: false,
    researchPoints: 4,
    upgrades: { jetpack: 0, scan: 0, minimap: 0 },
    sprintEnergy: 80,
    sonarCooldownS: 0,
    moraleBoostS: 0,
    isShipRepaired: false,
    nearObjectName: undefined,
    ...overrides,
  };
}

function makeMoonCtx(overrides: Partial<MoonGameContext> = {}): MoonGameContext {
  return {
    location: 'moon',
    relicIds: ['moon_apollo11'],
    monumentIds: [],
    lunarRockIds: [],
    iceScannedIds: ['ice_1', 'ice_2'],
    secretIds: [],
    thumperFired: false,
    ridingLrv: false,
    chapterCompleted: false,
    ...overrides,
  };
}

let passed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

clearNovaEvents();
pushNovaEvent({
  atPlaySeconds: 41,
  type: 'part_salvaged',
  detail: 'Photovoltaic Power Bus (Opportunity)',
});

const mockCtx = makeMarsCtx();
const marsPrompt = buildNovaSystemPrompt('mars', mockCtx);

check('1a. buildNovaSystemPrompt contains verified GAME_CONSTANTS literals', () => {
  const required = ['5.0', '280', '350', '420', '+15%', '6 s', '3 / 6', '4 / 8', '5 / 10', '60 Hz', '180'];
  for (const token of required) {
    assert.ok(marsPrompt.includes(token), `Expected Mars prompt to include ${JSON.stringify(token)}`);
  }
});

check('1b. buildNovaSystemPrompt contains every SHIP_PART name & equipment mission keyword & remaining parts', () => {
  for (const part of Object.values(SHIP_PARTS)) {
    assert.ok(marsPrompt.includes(part.name), `Missing part name in prompt: ${part.name}`);
  }
  const missionKeywords = [
    'Sojourner',
    'Opportunity',
    'InSight',
    'Spirit',
    'Deep Space',
    'Phoenix',
    'Lunar Roving',
    'Surveyor 3',
  ];
  for (const kw of missionKeywords) {
    assert.ok(marsPrompt.includes(kw), `Missing equipment mission keyword in prompt: ${kw}`);
  }
  assert.ok(Object.keys(EQUIPMENT_DEFINITIONS).length === 8);
  assert.ok(marsPrompt.includes('Titanium Suspension Arm'), 'Expected remaining part Titanium Suspension Arm');
  assert.ok(marsPrompt.includes('Cryogenic Thermal Core'), 'Expected remaining part Cryogenic Thermal Core');
  assert.ok(marsPrompt.includes('00:41'), 'Expected recent event timestamp in prompt');
});

check('2. buildNovaSystemPrompt does NOT contain stale or hallucinated facts', () => {
  const forbidden = [
    'Curiosity',
    'Perseverance',
    'Viking',
    '40 grid tiles',
    '8.0 seconds',
    '+25%',
    '12 seconds',
  ];
  for (const bad of forbidden) {
    assert.ok(!marsPrompt.includes(bad), `Forbidden stale term found in Mars prompt: ${bad}`);
  }
});

check('3. GAME_CONSTANTS values appear verbatim in rendered prompt & quick chips', () => {
  const allChipText = Object.values(QUICK_CHIP_ANSWERS).join('\n');
  assert.ok(marsPrompt.includes(String(GAME_CONSTANTS.PARTS_REQUIRED)));
  assert.ok(marsPrompt.includes(String(GAME_CONSTANTS.CALIBRATION.gimbal.target)));
  assert.ok(marsPrompt.includes(String(GAME_CONSTANTS.CALIBRATION.powerBusHz.target)));
  assert.ok(marsPrompt.includes(String(GAME_CONSTANTS.CALIBRATION.gyroTrim.target)));
  assert.ok(allChipText.includes(String(GAME_CONSTANTS.SONAR.COOLDOWN_S.toFixed(1))));
  assert.ok(allChipText.includes('+15%'));
  assert.ok(!allChipText.includes('+25%'));
});

check('4. Offline matcher avoids substring traps, checks Moon isolation, and answers manual cases', () => {
  const carpetResp = getOfflineFallbackResponse('Why is there a carpet on Mars?', 'mars', mockCtx);
  assert.ok(!carpetResp.includes('Morale Overdrive'), 'carpet must not trigger pet_nova');

  const repeatResp = getOfflineFallbackResponse('Please repeat that instruction', 'mars', mockCtx);
  assert.ok(!repeatResp.includes('Morale Overdrive'), 'repeat must not trigger pet_nova');

  const scanResp = getOfflineFallbackResponse('How do I scan?', 'mars', mockCtx);
  assert.ok(!scanResp.includes('Moon Buggy'), 'scan must not trigger Apollo rover');
  assert.ok(scanResp.includes('5.0'), 'scan should explain sonar ping');

  const moonUnmatched = getOfflineFallbackResponse('xyzzy plugh unknown question', 'moon', makeMoonCtx());
  assert.ok(
    moonUnmatched.includes('1/6th-G hopping') || moonUnmatched.includes('Apollo LRV'),
    'Moon unmatched must return Moon menu'
  );
  assert.ok(!moonUnmatched.includes('Valles Marineris'), 'Moon unmatched must not leak Mars Valles Marineris');

  const spiritResp = getOfflineFallbackResponse('How do I beat Spirit?', 'mars', mockCtx);
  assert.ok(
    spiritResp.toLowerCase().includes('spirit') &&
      spiritResp.includes('[A/D]') &&
      spiritResp.toLowerCase().includes('counter-steer'),
    'Spirit help should include Spirit controls'
  );

  const oxygenResp = getOfflineFallbackResponse('Do I have an oxygen meter or health bar?', 'mars', mockCtx);
  assert.ok(oxygenResp.toLowerCase().includes('no oxygen'), 'Must clarify there is no oxygen meter');

  const apolloMarsResp = getOfflineFallbackResponse('Is the Apollo rover really on Mars?', 'mars', mockCtx);
  assert.ok(
    apolloMarsResp.includes('Moon') && apolloMarsResp.toLowerCase().includes('fiction'),
    'Must clarify Apollo LRV is on the Moon in reality and explain Mars salvage fiction'
  );

  const weatherResp = getOfflineFallbackResponse("What's the weather right now?", 'mars', mockCtx);
  assert.ok(weatherResp.includes('Source:'), 'Weather reply must include source line');

  const stormResp = getOfflineFallbackResponse('How do I survive dust storms?', 'mars', mockCtx);
  assert.ok(stormResp.toLowerCase().includes('no open-world'), 'Storm reply must state no open-world storm hazard');

  const hopResp = getOfflineFallbackResponse('How do I hop on the Moon?', 'moon', makeMoonCtx());
  assert.ok(hopResp.includes('Space') && hopResp.includes('1.4'), 'Moon hop answer must cite Space and x1.4 speed');

  const affordResp = getOfflineFallbackResponse('Can I afford an upgrade?', 'mars', makeMarsCtx({ researchPoints: 4 }));
  assert.ok(affordResp.includes('Jetpack') && affordResp.includes('3 RP'), 'Upgrade check with 4 RP should cite Jetpack L1 (3 RP)');
});

check('5. computeNextStep priority branches', () => {
  const step0 = computeNextStep(
    makeMarsCtx({ collectedPartIds: [], completedEquipmentIds: [], researchPoints: 0 })
  );
  assert.ok(step0.includes('Sonar') && step0.includes('8 parts'), `Expected Sonar + 8 parts, got: ${step0}`);

  const allPartIds = Object.keys(SHIP_PARTS);
  const allEqIds = Object.keys(EQUIPMENT_DEFINITIONS);
  const step8 = computeNextStep(
    makeMarsCtx({ collectedPartIds: allPartIds, completedEquipmentIds: allEqIds, isShipRepaired: false })
  );
  assert.ok(
    step8.toLowerCase().includes('crashed ship') && step8.toLowerCase().includes('calibrate'),
    `Expected ship + calibrate, got: ${step8}`
  );

  const stepRepaired = computeNextStep(
    makeMarsCtx({ collectedPartIds: allPartIds, completedEquipmentIds: allEqIds, isShipRepaired: true })
  );
  assert.ok(stepRepaired.toLowerCase().includes('launch'), `Expected launch step, got: ${stepRepaired}`);

  const stepUpgrade = computeNextStep(
    makeMarsCtx({ collectedPartIds: ['part_drive_motor'], researchPoints: 3, upgrades: { jetpack: 0, scan: 0, minimap: 0 } })
  );
  assert.ok(stepUpgrade.includes('Jetpack') && stepUpgrade.includes('3 RP'), `Expected Jetpack L1 hint, got: ${stepUpgrade}`);
});

check('6. formatTelemetryForNova includes source and only uses "live" for NASA InSight Live', () => {
  const base: MarsTelemetry = {
    sol: 1042,
    season: 'Southern Spring',
    temperatureC: {
      current: -58.4,
      min: -95,
      max: -17,
      average: -63,
    },
    pressurePa: 612,
    windSpeedMs: 7.4,
    windDirectionDegrees: 112,
    dustOpticalDepthTau: 0.62,
    solarFluxWm2: 410,
    groundRadiationMsvYear: 270,
    stationName: 'Elysium Planitia (InSight Baseline)',
    source: 'NASA InSight Archive Cache',
    timestamp: '2026-11-12T00:00:00Z',
  };

  const archiveBlock = formatTelemetryForNova(base, 0.35);
  assert.ok(archiveBlock.includes('NASA InSight Archive Cache'));
  assert.ok(!/\blive\b/i.test(archiveBlock), 'Archive block must not contain the word "live"');
  assert.ok(archiveBlock.includes('in-game conditions now:'), 'Should include in-game conditions when solTime is given');

  const modelBlock = formatTelemetryForNova({ ...base, source: 'NASA Mars Scientific Model' });
  assert.ok(modelBlock.includes('NASA Mars Scientific Model'));
  assert.ok(!/\blive\b/i.test(modelBlock), 'Model block must not contain the word "live"');

  const liveBlock = formatTelemetryForNova({ ...base, source: 'NASA InSight Live' });
  assert.ok(liveBlock.includes('NASA InSight Live'));
  assert.ok(/\blive\b/i.test(liveBlock), 'Live block may say live');

  const telAns = getTelemetryAnswer('mars', mockCtx);
  assert.ok(telAns.includes('NASA InSight Archive Cache') || telAns.includes('NASA Mars Scientific Model'));
});

check('7. Gemini conversation builder & sanitizer', () => {
  const history: ChatMessage[] = [
    { id: 'welcome_1', sender: 'nova', text: 'Welcome!', timestamp: '08:00' },
    { id: 'nova_chip_1', sender: 'nova', text: 'Ignored chip reply', timestamp: '08:01', isQuickChip: true },
    { id: 'u1', sender: 'user', text: 'First question', timestamp: '08:02' },
    { id: 'u2', sender: 'user', text: 'Second consecutive user message', timestamp: '08:03' },
    { id: 'n1', sender: 'nova', text: 'Answer', timestamp: '08:04' },
  ];
  const contents = buildConversationContents('Final question', history);
  assert.equal(contents.length, 3);
  assert.equal(contents[0].role, 'user');
  assert.ok(contents[0].parts[0].text.includes('First question'));
  assert.ok(contents[0].parts[0].text.includes('Second consecutive user message'));
  assert.equal(contents[1].role, 'model');
  assert.equal(contents[2].role, 'user');
  assert.equal(contents[2].parts[0].text, 'Final question');

  const dirty = '<GAME_STATE>\n{{NEXT_STEP}}\nAll **systems** nominal.';
  assert.equal(sanitizeNovaReply(dirty), 'All **systems** nominal.');
});

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
} else {
  console.log(`\nAll ${passed} NOVA prompt & logic checks passed.`);
}
