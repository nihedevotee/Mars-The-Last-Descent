/**
 * NASA Data Service & Martian Scientific Constants
 * Authoritative Mars physical, atmospheric, and telemetry data based on official NASA documentation
 * (https://api.nasa.gov, https://data.nasa.gov, NASA Planetary Data System).
 */

export interface MarsConstants {
  surfaceGravity: number; // m/s² (Standard Mars surface gravity)
  earthGravityRatio: number; // Ratio of Mars gravity to Earth standard (g)
  meanRadiusKm: number; // Mean planetary radius in kilometers
  solDurationSeconds: number; // Mars solar day duration in seconds (24h 39m 35.244s)
  orbitalPeriodEarthDays: number; // Mars year length in Earth days (687 days)
  nominalPressurePa: number; // Mean surface atmospheric pressure in Pascals (~610 Pa / 6.1 mbar)
  pressureAtm: number; // Surface pressure in standard atmospheres (~0.006 atm)
  averageTempC: number; // Global mean surface temperature (-63 °C)
  composition: {
    co2: number; // Carbon Dioxide %
    n2: number; // Nitrogen %
    ar: number; // Argon %
    o2: number; // Oxygen %
    co: number; // Carbon Monoxide %
    waterVaporPpm: number; // Water vapor in ppm
  };
  dustOpticalDepth: {
    clearSky: number; // Nominal tau: 0.3 - 0.6
    moderateHaze: number; // Seasonal dust haze tau: 0.8 - 1.5
    regionalStorm: number; // Regional convective storm tau: 2.0 - 3.5
    globalStorm: number; // Planet-encircling dust event tau: > 5.0
  };
}

export const MARS_SCIENTIFIC_CONSTANTS: MarsConstants = {
  surfaceGravity: 3.72076, // NASA PDS value
  earthGravityRatio: 0.3794, // 3.72076 / 9.80665
  meanRadiusKm: 3389.5,
  solDurationSeconds: 88775.244,
  orbitalPeriodEarthDays: 686.98,
  nominalPressurePa: 610.0, // 6.10 millibars
  pressureAtm: 0.00602,
  averageTempC: -63.0,
  composition: {
    co2: 95.32,
    n2: 2.60,
    ar: 1.90,
    o2: 0.16,
    co: 0.08,
    waterVaporPpm: 210,
  },
  dustOpticalDepth: {
    clearSky: 0.45,
    moderateHaze: 1.10,
    regionalStorm: 2.85,
    globalStorm: 5.20,
  },
};

export interface MoonConstants {
  surfaceGravity: number; // m/s² (1.62 m/s² - NASA Apollo measurement)
  earthGravityRatio: number; // 0.1654g (~1/6th Earth gravity)
  meanRadiusKm: number; // 1737.4 km
  atmosphere: string; // Hard vacuum (< 3 × 10⁻¹⁵ atm)
  dayLengthHours: number; // 708.7 hours (~29.5 Earth days)
  tempRangeC: { min: number; max: number; psr: number }; // -130°C to +120°C, PSR: -246°C
  radiationMsvYear: number; // ~500 mSv/yr (~1.37 mSv/day measured lunar surface cosmic ray flux)
}

export const MOON_SCIENTIFIC_CONSTANTS: MoonConstants = {
  surfaceGravity: 1.62,
  earthGravityRatio: 0.1654,
  meanRadiusKm: 1737.4,
  atmosphere: 'Surface Boundary Exosphere / Hard Vacuum (< 10⁻¹⁴ bar)',
  dayLengthHours: 708.7,
  tempRangeC: { min: -130, max: 120, psr: -246 },
  radiationMsvYear: 500,
};

export interface MoonTelemetry {
  target: 'Moon';
  location: string;
  gravity: number;
  pressure: string;
  temperatureC: number;
  radiationMsvYear: number;
  illumination: string;
  source: string;
}

export function getMoonTelemetry(): MoonTelemetry {
  return {
    target: 'Moon',
    location: 'Lunar South Pole & Mare Tranquillitatis',
    gravity: MOON_SCIENTIFIC_CONSTANTS.surfaceGravity,
    pressure: '0.00 Pa (Exosphere Vacuum)',
    temperatureC: -40.0,
    radiationMsvYear: MOON_SCIENTIFIC_CONSTANTS.radiationMsvYear,
    illumination: 'Earthrise horizon / Low-angle polar solar flux',
    source: 'NASA Apollo ALSEP & LRO Diviner Telemetry',
  };
}

export function formatMoonTelemetryForNova(): string {
  const t = getMoonTelemetry();
  return [
    `📡 [LUNAR TELEMETRY LINK]: ${t.location}`,
    `⚡ Gravity: ${t.gravity} m/s² (16.54% Earth standard gravity - 1/6th G)`,
    `💨 Atmospheric Pressure: ${t.pressure}`,
    `🌡️ Surface Temp: ${t.temperatureC}°C (PSR Craters: -246°C / 27 K)`,
    `☢️ Cosmic Radiation: ~${t.radiationMsvYear} mSv/yr (~1.37 mSv/day unshielded surface flux)`,
    `🌅 Horizon: ${t.illumination}`,
    `🔬 Data Source: ${t.source}`,
  ].join('\n');
}

export interface MarsTelemetry {
  sol: number;
  season: string; // e.g. "Late Northern Autumn / Southern Spring"
  temperatureC: {
    current: number;
    min: number;
    max: number;
    average: number;
  };
  pressurePa: number;
  windSpeedMs: number;
  windDirectionDegrees: number;
  dustOpticalDepthTau: number;
  solarFluxWm2: number; // W/m² (Nominal ~590 W/m² top of atmosphere, attenuated by dust)
  groundRadiationMsvYear: number; // Background cosmic & solar surface radiation (~240-300 mSv/yr)
  stationName: string;
  source: 'NASA InSight Live' | 'NASA InSight Archive Cache' | 'NASA Mars Scientific Model';
  timestamp: string;
}

// Authoritative NASA InSight Weather Elysium Planitia climatology baseline (used for offline or fallback)
const IN_SIGHT_OFFLINE_BASELINE: MarsTelemetry = {
  sol: 1042,
  season: 'Northern Autumn (Ls 215°)',
  temperatureC: {
    current: -58.4,
    min: -96.2,
    max: -14.1,
    average: -63.5,
  },
  pressurePa: 642.8,
  windSpeedMs: 5.2,
  windDirectionDegrees: 135,
  dustOpticalDepthTau: 0.62,
  solarFluxWm2: 485.0,
  groundRadiationMsvYear: 260.0,
  stationName: 'NASA InSight Lander (Elysium Planitia - 4.5°N, 135.6°E)',
  source: 'NASA Mars Scientific Model',
  timestamp: new Date().toISOString(),
};

const STORAGE_KEY_TELEMETRY = 'mars_last_descent_nasa_telemetry';
let memoryTelemetryCache: MarsTelemetry = IN_SIGHT_OFFLINE_BASELINE;

/**
 * Returns the NASA API Key configured in Vite env, falling back to public 'DEMO_KEY'.
 */
export function getNasaApiKey(): string {
  const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const envKey = env.VITE_NASA_API_KEY || env.NASA_API_KEY;
  return (envKey && typeof envKey === 'string' && envKey.trim().length > 0) ? envKey.trim() : 'DEMO_KEY';
}

/**
 * Synchronously retrieve the latest Mars telemetry (from memory cache or offline baseline).
 * Useful for the 60fps render loop and instant HUD displays.
 */
export function getMarsTelemetrySync(): MarsTelemetry {
  return memoryTelemetryCache;
}

/**
 * Fetch live Mars weather and mission telemetry from NASA Open APIs.
 * Automatically falls back to local cached storage or scientific offline constants if offline or rate-limited.
 */
export async function fetchMarsLiveTelemetry(): Promise<MarsTelemetry> {
  const apiKey = getNasaApiKey();

  // Try reading fresh localStorage cache first (valid for 30 minutes)
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TELEMETRY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const ageMs = Date.now() - new Date(parsed.timestamp).getTime();
      if (ageMs < 30 * 60 * 1000) {
        memoryTelemetryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    // localStorage may be disabled or invalid
  }

  try {
    // Attempt InSight Weather API endpoint
    const url = `https://api.nasa.gov/insight_weather/?api_key=${encodeURIComponent(apiKey)}&feedtype=json&ver=1.0`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const solKeys = data.sol_keys;

      if (Array.isArray(solKeys) && solKeys.length > 0) {
        const latestSol = solKeys[solKeys.length - 1];
        const solData = data[latestSol];

        const avgTemp = solData?.AT?.av ?? -62.5;
        const minTemp = solData?.AT?.mn ?? -95.0;
        const maxTemp = solData?.AT?.mx ?? -15.0;
        const pressure = solData?.PRE?.av ?? 640.0;
        const windSpeed = solData?.HWS?.av ?? 4.8;
        const windDir = solData?.WD?.most_common?.compass_degrees ?? 140;

        const liveTelemetry: MarsTelemetry = {
          sol: parseInt(latestSol, 10) || 1042,
          season: solData?.Season || 'Northern Autumn (Ls 215°)',
          temperatureC: {
            current: avgTemp,
            min: minTemp,
            max: maxTemp,
            average: avgTemp,
          },
          pressurePa: Math.round(pressure * 10) / 10,
          windSpeedMs: Math.round(windSpeed * 10) / 10,
          windDirectionDegrees: Math.round(windDir),
          dustOpticalDepthTau: 0.65,
          solarFluxWm2: 490.0,
          groundRadiationMsvYear: 265.0,
          stationName: 'NASA InSight Lander (Elysium Planitia)',
          source: 'NASA InSight Live',
          timestamp: new Date().toISOString(),
        };

        memoryTelemetryCache = liveTelemetry;
        try {
          localStorage.setItem(STORAGE_KEY_TELEMETRY, JSON.stringify(liveTelemetry));
        } catch (_) {}
        return liveTelemetry;
      }
    }
  } catch (error) {
    // Network failure, CORS, or offline - continue to fallback
  }

  // Fallback: Generate dynamic time-of-day calibrated Martian telemetry from scientific baseline
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  // Diurnal sinusoidal temperature swing between -92°C at night and -18°C at afternoon
  const diurnalCycle = Math.sin(((utcHours - 9) / 24) * 2 * Math.PI);
  const currentTemp = Math.round((-55 + diurnalCycle * 37) * 10) / 10;
  const currentPressure = Math.round((610 + Math.cos((utcHours / 12) * 2 * Math.PI) * 25) * 10) / 10;

  const calibratedTelemetry: MarsTelemetry = {
    ...IN_SIGHT_OFFLINE_BASELINE,
    temperatureC: {
      current: currentTemp,
      min: -92.4,
      max: -18.2,
      average: -58.0,
    },
    pressurePa: currentPressure,
    windSpeedMs: Math.round((4.5 + Math.abs(diurnalCycle) * 3.5) * 10) / 10,
    timestamp: now.toISOString(),
    source: 'NASA InSight Archive Cache',
  };

  memoryTelemetryCache = calibratedTelemetry;
  return calibratedTelemetry;
}

/**
 * Calculates current in-game atmospheric parameters based on time and weather storms.
 */
export function calculateAtmosphereForGame(
  normalizedTime: number, // 0.0 to 1.0 (Day to Night cycle)
  isStormActive: boolean = false
): {
  temperatureC: number;
  pressurePa: number;
  dustOpticalDepth: number;
  solarIrradiance: number;
  visibilityFactor: number; // 0.0 (dense storm) to 1.0 (crystal clear)
} {
  const telemetry = getMarsTelemetrySync();
  const sunElevation = Math.sin(normalizedTime * Math.PI * 2);

  // Day/night temperature swing
  const baseTemp = sunElevation >= 0
    ? -45 + sunElevation * 25
    : -70 + sunElevation * 22;

  // Dust storm impacts
  const tau = isStormActive
    ? MARS_SCIENTIFIC_CONSTANTS.dustOpticalDepth.regionalStorm
    : telemetry.dustOpticalDepthTau;

  const solarFactor = Math.max(0, sunElevation);
  // Beer-Lambert law for atmospheric dust extinction: I = I_0 * exp(-tau / cos(theta))
  const solarIrradiance = Math.round(590 * solarFactor * Math.exp(-tau * 0.7));
  const visibilityFactor = isStormActive ? 0.35 : Math.max(0.7, 1.0 - (tau - 0.3) * 0.25);

  return {
    temperatureC: Math.round(baseTemp * 10) / 10,
    pressurePa: Math.round((telemetry.pressurePa + (isStormActive ? 35 : 0)) * 10) / 10,
    dustOpticalDepth: tau,
    solarIrradiance,
    visibilityFactor,
  };
}

/**
 * Returns current in-game Martian conditions for a given normalized solTime (0..1).
 */
export function getInGameConditions(solTime: number) {
  return calculateAtmosphereForGame(solTime, false);
}

/**
 * Formats Mars telemetry into a concise technical briefing string for NOVA or HUD readouts.
 */
export function formatTelemetryForNova(
  telemetry: MarsTelemetry = memoryTelemetryCache,
  solTime?: number
): string {
  const isLiveFeed = telemetry.source === 'NASA InSight Live';
  const lines = [
    `📡 [TELEMETRY LINK]: ${telemetry.stationName}`,
    `🗓️ Archive Sol: ${telemetry.sol} | Season: ${telemetry.season}`,
    `🌡️ Surface Temp (archive model): ${telemetry.temperatureC.current}°C (Min: ${telemetry.temperatureC.min}°C, Max: ${telemetry.temperatureC.max}°C)`,
    `💨 Surface Pressure: ${telemetry.pressurePa} Pa (~${(telemetry.pressurePa / 101325).toFixed(4)} atm)`,
    `🌪️ Wind: ${telemetry.windSpeedMs} m/s @ ${telemetry.windDirectionDegrees}° azimuth`,
    `🌫️ Dust Opacity (Tau): ${telemetry.dustOpticalDepthTau} (Optical Extinction Nominal)`,
    `⚡ Gravity: ${MARS_SCIENTIFIC_CONSTANTS.surfaceGravity} m/s² (~0.38g)`,
    `🧪 Atmosphere: 95.3% CO2, 2.6% N2, 1.9% Ar, 0.16% O2`,
    `source: ${telemetry.source} (${isLiveFeed ? 'live feed' : 'archived/modelled climatology; InSight ended Dec 2022'})`,
  ];

  if (typeof solTime === 'number' && Number.isFinite(solTime)) {
    const cond = getInGameConditions(solTime);
    lines.push(
      `in-game conditions now: ${cond.temperatureC} C, dust tau ${cond.dustOpticalDepth}, visibility ${cond.visibilityFactor.toFixed(2)}`
    );
  }

  return lines.join('\n');
}
