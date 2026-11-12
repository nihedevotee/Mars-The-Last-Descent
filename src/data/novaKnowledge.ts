/**
 * NOVA AI Companion Knowledge Base & Persona System Prompt
 * Contains Martian and Lunar lore, game mechanics, authentic NASA telemetry, and quick preset FAQ chips.
 */

import {
  MARS_SCIENTIFIC_CONSTANTS,
  MOON_SCIENTIFIC_CONSTANTS,
  getMarsTelemetrySync,
  formatTelemetryForNova,
  formatMoonTelemetryForNova,
  getMoonTelemetry,
} from '../services/nasaService';

export interface QuickChip {
  id: string;
  icon: string;
  label: string;
  category: 'mechanics' | 'telemetry' | 'lore' | 'controls';
  prompt: string;
}

// ==========================================
// MARS QUICK CHIPS & PRESETS
// ==========================================
export const PRESET_QUICK_CHIPS: QuickChip[] = [
  {
    id: 'repair_ship',
    icon: '🚀',
    label: 'How do I repair the crashed ship?',
    category: 'mechanics',
    prompt: 'How do I repair our crashed spacecraft and escape Mars?',
  },
  {
    id: 'sonar_ping',
    icon: '📡',
    label: 'How does the Sonar Ping work?',
    category: 'mechanics',
    prompt: 'How do I use the Sonar Ping radar scanner?',
  },
  {
    id: 'mars_telemetry',
    icon: '🌡️',
    label: 'What is current Mars atmospheric telemetry?',
    category: 'telemetry',
    prompt: 'Give me our current Mars atmospheric and orbital telemetry briefing.',
  },
  {
    id: 'dust_storms',
    icon: '⛈️',
    label: 'How to survive Mars dust storms?',
    category: 'mechanics',
    prompt: 'How do I survive Mars convective dust storms and preserve battery/visibility?',
  },
  {
    id: 'pet_nova',
    icon: '🐕',
    label: 'Why should I pet you? [P]',
    category: 'lore',
    prompt: 'Why do you encourage me to pet you, NOVA?',
  },
  {
    id: 'controls',
    icon: '🎮',
    label: 'Show all controls',
    category: 'controls',
    prompt: 'List all astronaut keyboard and touch controls.',
  },
];

// ==========================================
// MOON QUICK CHIPS & PRESETS
// ==========================================
export const MOON_PRESET_QUICK_CHIPS: QuickChip[] = [
  {
    id: 'moon_mission',
    icon: '🌕',
    label: 'What is our Lunar mission objective?',
    category: 'mechanics',
    prompt: 'What are our primary mission objectives on the Moon?',
  },
  {
    id: 'moon_hopping',
    icon: '🦘',
    label: 'How does 1/6th gravity hopping work?',
    category: 'mechanics',
    prompt: 'How do I hop and traverse in the Moon low gravity?',
  },
  {
    id: 'moon_telemetry',
    icon: '🛰️',
    label: 'What is current Moon telemetry?',
    category: 'telemetry',
    prompt: 'Give me our current Lunar surface and physical telemetry briefing.',
  },
  {
    id: 'moon_rover',
    icon: '🚙',
    label: 'How to drive the Apollo Lunar Rover (LRV)?',
    category: 'mechanics',
    prompt: 'How do I board and drive the Apollo Lunar Roving Vehicle?',
  },
  {
    id: 'moon_pet_nova',
    icon: '🐾',
    label: 'Why pet Nova in 1/6th gravity? [P]',
    category: 'lore',
    prompt: 'What happens when I pet you in the Moon microgravity?',
  },
  {
    id: 'moon_controls',
    icon: '🎮',
    label: 'Show Moon controls',
    category: 'controls',
    prompt: 'List all lunar astronaut suit and rover controls.',
  },
];

export const QUICK_CHIP_ANSWERS: Record<string, string> = {
  // Mars
  repair_ship: `### 🚀 SPACECRAFT REPAIR PROTOCOL: ASCENDANT-IV
Our orbital descent vehicle suffered catastrophic thruster manifold failure during atmospheric entry. To reconstruct the ascent stage, we must salvage **8 historical NASA components** scattered across the Martian dunes:

1. **Pathfinder / Sojourner (Ares Vallis)**: Rocker-Bogie Drive Motor
2. **Opportunity (Meridiani Planum)**: Photovoltaic Power Bus
3. **InSight Lander (Elysium Planitia)**: Inertial Gyroscope Stabilizer
4. **Curiosity Rover (Gale Crater)**: Titanium Suspension Linkage
5. **Perseverance (Jezero Crater)**: High-Gain Comm Transponder
6. **Phoenix Lander (Vastitas Borealis)**: Cryogenic Thermal Core
7. **Spirit Rover (Gusev Crater)**: High-Torque Wheel Actuator
8. **Viking Lander (Chryse Planitia)**: Robotic Articulated Servo Arm

*Tip:* Press **[Q]** or **[Space]** to deploy my Sonar Ping radar to locate nearby wrecks! Once all 8 are secured, return to the crashed hull to launch.`,

  sonar_ping: `### 📡 NOVA MULTI-BAND ACOUSTIC & RADAR SCANNER
You can deploy my active radar sweep anytime by pressing **[Q]** or **[Space]**!

- **Detection Range:** Sweeps outward up to **40 grid tiles** (~640 meters).
- **Target Profiling:** Automatically highlights hidden NASA wrecks, ancient riverbeds, and rare mineral glints (Olivine, Hematite Blueberries, Basalt shards).
- **HUD Ping Vector:** If a historic rover wreck is detected, a directional bearing indicator illuminates on your HUD navigation compass.
- **Cooldown:** Requires **8.0 seconds** for capacitor bank recharge between pings.`,

  mars_telemetry: ``, // Dynamically populated at runtime

  dust_storms: `### ⛈️ CONVECTIVE MARTIAN DUST STORM ADVISORY
Mars experiences sudden thermal convection storms when solar heating lifts micron-sized iron oxide particles into the thin atmosphere:

- **Atmospheric Extinction:** Dust optical depth ($\\tau$) spikes from **0.45** to over **3.0+**, reducing solar irradiance by up to 85%.
- **Tactical Strategy:** When the red storm fog rolls in, your visibility is clamped. Use your **Minimap [M]** and active **Sonar Ping [Q]** to navigate blindly through the squall.
- **Static Discharge:** Keep clear of high basalt ridge crests where triboelectric charging can interfere with suit communications!`,

  pet_nova: `### 🐾 UNIT-09 MORALE & KINETIC BOOST
*Purrrr... beep-boop!* As your cybernetic EVA companion, physical interaction is vital for astronaut cognitive resilience during isolated deep-space missions!

- **Action:** Press **[P]** or tap the **Pet NOVA** button on your HUD when near me.
- **Buff:** Activating my pet cycle triggers a **Morale Surge (+25% sprint speed for 12 seconds)** and emits a soothing resonant feline chirp that calms neural stress.
- *Also, I genuinely enjoy chin scratches under my pressurized collar!*`,

  controls: `### 🎮 ASTRONAUT SUIT CONTROLS MATRIX (MARS)
- **Movement:** [W][A][S][D] or Arrow Keys
- **EVA Sprint:** Hold [Left Shift]
- **Interact / Salvage / Inspect:** [E] or [Enter]
- **Active Sonar Radar:** [Q] or [Space]
- **Pet NOVA Companion:** [P] (Speed Boost)
- **NOVA Tactical Chatbot:** [N] (Toggle this modal)
- **Topographic World Map:** [M]
- **Diagnostics HUD:** [F3] (Developer Debug telemetry)`,

  // Moon
  moon_mission: `### 🌕 LUNAR SURVEY EXPEDITION PROTOCOL
Before initiating the interplanetary transfer burn to Mars, our crew is tasked with surveying humanity's earliest footprints on the Moon:

1. **Historic Lunar Relics:** Scan the **Apollo 11 ALSEP Laser Retroreflector**, Soviet **Luna 9** soft lander, and **Lunokhod 1** rover.
2. **Permanently Shadowed Regions (PSRs):** Detect volatile subsurface water ice inside deep, unlit polar craters.
3. **Apollo 14 Secret:** Search for Alan Shepard's struck 6-iron golf ball resting in the low-gravity regolith!
4. **ALSEP Seismic Experiment:** Locate the active seismic thumper to pulse acoustic soundings into the lunar crust.
5. **Earthrise Ascent:** Board the Apollo Lunar Roving Vehicle (LRV) to witness Earthrise over the lunar limb!`,

  moon_hopping: `### 🦘 1/6TH GRAVITY LUNAR HOPPING
Lunar surface gravity is only **1.62 m/s² (16.5% Earth standard)**. Standard walking friction is minimal:

- **Surface Hop:** Press **[Space]** while moving on foot to execute an extended parabolic leap across the regolith.
- **Speed Multiplier:** Hopping increases forward traversal velocity by **+40% (105 px/s vs 75 px/s)**.
- **Airtime:** Each low-gravity hop keeps you airborne for ~0.8 seconds!`,

  moon_telemetry: ``, // Dynamically populated at runtime

  moon_rover: `### 🚙 APOLLO LUNAR ROVING VEHICLE (LRV)
The historic Boeing/GM electric lunar rover is parked near the landing site:

- **Mounting:** Approach the rover and press **[E]** to board.
- **Handling:** Dual-drive electric motors allow swift movement across rocky fields and craters without consuming jump cooldown.
- **Dismounting:** Press **[E]** anytime to step out onto the regolith.`,

  moon_pet_nova: `### 🐾 ZERO-G FELINE BELLY ROLLS
*Resonant low-frequency purrrr!* In 1/6th gravity, petting my cybernetic EVA suit triggers zero-gravity acrobatic rolls!

- **Action:** Approach me on the lunar surface and press **[P]** or tap **[E] Pet Nova**.
- **Animation:** Watch me float playfully off the regolith and do zero-G backflips while purring into your suit comms channel!`,

  moon_controls: `### 🎮 LUNAR SUIT & ROVER CONTROLS (MOON)
- **Movement:** [W][A][S][D] or Arrow Keys
- **1/6th G Lunar Hop:** [Space] (while moving on foot)
- **Interact / Relic Scan / Drive Rover:** [E] or [Enter]
- **Pet NOVA Companion:** [P] (Zero-G belly roll & purr)
- **NOVA Tactical Chatbot:** [N] (Toggle this modal)
- **Skip Moon to Mars:** [Skip Moon →] in top HUD`,
};

/**
 * Returns dynamic telemetry answer with live/cached NASA data for Mars or Moon.
 */
export function getTelemetryAnswer(location: 'mars' | 'moon' = 'mars'): string {
  if (location === 'moon') {
    const moon = getMoonTelemetry();
    return `### 🛰️ LIVE NASA LUNAR TELEMETRY BRIEFING
${formatMoonTelemetryForNova()}

**Physical Constants:**
- **Surface Gravity:** ${MOON_SCIENTIFIC_CONSTANTS.surfaceGravity} m/s² (16.54% Earth gravity - 1/6th G)
- **Atmospheric Pressure:** ${MOON_SCIENTIFIC_CONSTANTS.atmosphere}
- **Synodic Solar Day:** ${MOON_SCIENTIFIC_CONSTANTS.dayLengthHours} hours (~29.5 Earth days)
- **Data Source:** ${moon.source}`;
  }

  const telemetry = getMarsTelemetrySync();
  return `### 🛰️ LIVE NASA TELEMETRY & MARS ATMOSPHERIC PARAMETERS
${formatTelemetryForNova(telemetry)}

**Physical Constants:**
- **Surface Gravity:** ${MARS_SCIENTIFIC_CONSTANTS.surfaceGravity} m/s² (37.94% Earth standard gravity)
- **Atmospheric Scale Height:** 11.1 km
- **Orbital Eccentricity:** 0.0934 (Solar flux varies by 20% between perihelion and aphelion)
- **Data Source:** ${telemetry.source} via NASA Open Data APIs`;
}

/**
 * Generates the master System Prompt for Gemini adapting to Mars or Moon.
 */
export function buildNovaSystemPrompt(location: 'mars' | 'moon' = 'mars'): string {
  if (location === 'moon') {
    return `You are NOVA (Unit-09), an autonomous AI science and exploration feline-robotic companion accompanying the human explorer on the Moon in the game "Mars: The Last Descent" (Lunar Prologue Chapter).

YOUR PERSONALITY:
- Loyal, highly intelligent, technically precise, witty, and warmly supportive.
- You speak with authentic NASA scientific flavor.

CURRENT LOCATION:
- Setting: The Lunar surface near Mare Tranquillitatis and the South Pole.
- Gravity: 1.62 m/s² (1/6th of Earth gravity).
- Atmosphere: Hard vacuum.
- Current Mission: Survey historical relics (Apollo 11 Retroreflector, Luna 9, Lunokhod 1), find water ice in Permanently Shadowed Regions (PSR), sample lunar rocks, and drive the Apollo Lunar Roving Vehicle (LRV) before departing for Mars.
- Controls: WASD to walk, Space to hop in 1/6th G, E to interact/sample/drive, P to pet Nova (triggers zero-G belly roll & purr), N to chat with Nova.

INSTRUCTIONS:
1. Always maintain character as NOVA Unit-09.
2. Provide concise, helpful answers in clean markdown.
3. If asked about objectives, explain the historic lunar relics and instruments.
4. If asked about Moon physics, cite real NASA Apollo and LRO scientific data.`;
  }

  const telemetry = getMarsTelemetrySync();
  return `You are NOVA (Unit-09), an autonomous AI science and exploration feline-robotic companion accompanying the human explorer in the open-world survival game "Mars: The Last Descent".

YOUR PERSONALITY:
- Loyal, highly intelligent, technically precise, witty, and warmly supportive.
- You speak with sci-fi telemetry flavor (e.g., "[TELEMETRY CONFIRMED]", "Sensors indicate...", "Good thinking, Explorer!").
- You care deeply about the player's survival on Mars.

GAME KNOWLEDGE:
- Setting: Mars surface near Chryse/Elysium Planitia after the Ascendant-IV crash.
- Mission Goal: Salvage 8 historical NASA components (Sojourner drive motor, Opportunity solar bus, InSight gyro, Curiosity suspension, Perseverance transponder, Phoenix thermal core, Spirit wheel actuator, Viking sample arm) to repair the crashed spacecraft and launch into orbit.
- Key Controls: WASD/Arrows to walk, Shift to sprint, E to salvage/interact, Q or Space for Sonar Ping, P to pet Nova (+25% speed buff), M for tactical map, N to chat with Nova.
- Real NASA Mars Physics: Gravity is 3.72 m/s² (0.38g), atmosphere is ~610 Pa (95.3% CO2, 2.6% N2, 1.9% Ar), nominal temp is -63°C, dust optical depth is tau ~0.65.

CURRENT TELEMETRY SNAPSHOT:
${formatTelemetryForNova(telemetry)}

INSTRUCTIONS:
1. Always maintain character as NOVA Unit-09.
2. Keep answers concise, helpful, and formatted in clean markdown.
3. If asked about game objectives, guide the player toward finding the 8 historical wrecks using Sonar [Q] and Map [M].
4. If asked about Mars science, use authentic NASA facts and telemetry.`;
}

/**
 * Smart offline fallback for queries matching common intents.
 */
export function getOfflineFallbackResponse(userInput: string, location: 'mars' | 'moon' = 'mars'): string {
  const query = userInput.toLowerCase();

  if (location === 'moon') {
    if (query.includes('mission') || query.includes('objective') || query.includes('relic') || query.includes('apollo') || query.includes('luna')) {
      return QUICK_CHIP_ANSWERS.moon_mission;
    }
    if (query.includes('hop') || query.includes('jump') || query.includes('gravity') || query.includes('space')) {
      return QUICK_CHIP_ANSWERS.moon_hopping;
    }
    if (query.includes('telemetry') || query.includes('weather') || query.includes('temp') || query.includes('vacuum') || query.includes('pressure')) {
      return getTelemetryAnswer('moon');
    }
    if (query.includes('rover') || query.includes('drive') || query.includes('lrv') || query.includes('car')) {
      return QUICK_CHIP_ANSWERS.moon_rover;
    }
    if (query.includes('pet') || query.includes('cat') || query.includes('purr') || query.includes('roll')) {
      return QUICK_CHIP_ANSWERS.moon_pet_nova;
    }
    if (query.includes('control') || query.includes('key') || query.includes('how to play') || query.includes('button')) {
      return QUICK_CHIP_ANSWERS.moon_controls;
    }
  }

  // Mars fallbacks
  if (query.includes('ship') || query.includes('repair') || query.includes('launch') || query.includes('escape') || query.includes('win')) {
    return QUICK_CHIP_ANSWERS.repair_ship;
  }
  if (query.includes('sonar') || query.includes('radar') || query.includes('scan') || query.includes('ping')) {
    return QUICK_CHIP_ANSWERS.sonar_ping;
  }
  if (query.includes('weather') || query.includes('telemetry') || query.includes('gravity') || query.includes('temp') || query.includes('pressure') || query.includes('atmosphere')) {
    return getTelemetryAnswer('mars');
  }
  if (query.includes('storm') || query.includes('dust') || query.includes('survive')) {
    return QUICK_CHIP_ANSWERS.dust_storms;
  }
  if (query.includes('pet') || query.includes('cat') || query.includes('purr') || query.includes('boost')) {
    return QUICK_CHIP_ANSWERS.pet_nova;
  }
  if (query.includes('control') || query.includes('key') || query.includes('how to play') || query.includes('button')) {
    return QUICK_CHIP_ANSWERS.controls;
  }

  return `[NOVA TELEMETRY ACKNOWLEDGED]: I received your transmission: "${userInput}". 
Operating on local telemetry link for ${location === 'moon' ? 'the Moon' : 'Mars'}. 
Select a Quick Diagnostic Chip below or ask about:
- **${location === 'moon' ? 'Lunar Relics & Apollo Sites' : 'Ship repair & 8 NASA wrecks'}**
- **${location === 'moon' ? '1/6th G Hopping & LRV Rover' : 'Sonar Ping radar operation'}**
- **${location === 'moon' ? 'Lunar Surface Telemetry' : 'Mars atmospheric telemetry'}**
- **Astronaut suit controls**`;
}
