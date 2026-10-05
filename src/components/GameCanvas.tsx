import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sound } from '../systems/audio';

export type GameEnvironment = 'moon' | 'mars';

export interface InteractiveEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'discovery' | 'ship' | 'rover' | 'lander' | 'station';
  discovered: boolean;
  label: string;
}

interface GameCanvasProps {
  environment: GameEnvironment;
  entities: InteractiveEntity[];
  onInteract: (entityId: string) => void;
  onNovaComment?: (text: string, mood?: 'idle' | 'happy' | 'curious' | 'scanning') => void;
  stormIntensity?: number; // 0 to 1 for Mars dust storms
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  environment,
  entities,
  onInteract,
  onNovaComment,
  stormIntensity = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player state in world coordinates
  const playerRef = useRef({
    x: 180,
    y: 380,
    vx: 0,
    vy: 0,
    facing: 1 as 1 | -1,
    isGrounded: true,
    isJumping: false,
    walkFrame: 0,
  });

  // NOVA companion state in world coordinates
  const novaRef = useRef({
    x: 130,
    y: 390,
    vx: 0,
    facing: 1 as 1 | -1,
    hoverFrame: 0,
    scanning: false,
  });

  // World dimensions
  const worldWidth = environment === 'moon' ? 2400 : 3600;
  const worldHeight = 600;
  const groundY = 460;

  // Active inputs
  const keysRef = useRef({
    left: false,
    right: false,
    jump: false,
    interact: false,
  });

  const [activeNearbyEntity, setActiveNearbyEntity] = useState<InteractiveEntity | null>(null);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code)) keysRef.current.right = true;
      if (['Space', 'ArrowUp', 'KeyW', 'w', 'W'].includes(e.code)) {
        if (!keysRef.current.jump) keysRef.current.jump = true;
      }
      if (['KeyE', 'e', 'E', 'Enter'].includes(e.code)) {
        keysRef.current.interact = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code)) keysRef.current.right = false;
      if (['Space', 'ArrowUp', 'KeyW', 'w', 'W'].includes(e.code)) keysRef.current.jump = false;
      if (['KeyE', 'e', 'E', 'Enter'].includes(e.code)) keysRef.current.interact = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    let animId: number;
    let cameraX = 0;
    let time = 0;

    // Atmospheric particles
    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * worldWidth,
      y: Math.random() * worldHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 0.8 + 0.2,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      time += 0.04;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const viewW = canvas.width;
      const viewH = canvas.height;

      // Physics constants based on planetary gravity
      const isMoon = environment === 'moon';
      const gravity = isMoon ? 0.24 : 0.45; // Low lunar vs Mars gravity
      const jumpPower = isMoon ? -8.5 : -10.5;
      const moveSpeed = 4.2;

      const player = playerRef.current;
      const nova = novaRef.current;

      // Handle Horizontal Movement
      if (keysRef.current.left) {
        player.vx = -moveSpeed;
        player.facing = -1;
        player.walkFrame += 0.2;
      } else if (keysRef.current.right) {
        player.vx = moveSpeed;
        player.facing = 1;
        player.walkFrame += 0.2;
      } else {
        player.vx *= 0.8;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
      }

      // Handle Jump
      if (keysRef.current.jump && player.isGrounded) {
        player.vy = jumpPower;
        player.isGrounded = false;
        player.isJumping = true;
        sound.playHover();
      }

      // Apply Gravity
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;

      // World Ground Collision
      if (player.y >= groundY - 48) {
        player.y = groundY - 48;
        player.vy = 0;
        player.isGrounded = true;
        player.isJumping = false;
      }

      // World Boundary Constraints
      if (player.x < 40) player.x = 40;
      if (player.x > worldWidth - 60) player.x = worldWidth - 60;

      // --- NOVA Kinematics (Follow Player with playful spring) ---
      const targetNovaX = player.facing === 1 ? player.x - 55 : player.x + 55;
      const targetNovaY = player.y + 16;
      nova.hoverFrame += 0.08;
      const hoverOffset = Math.sin(nova.hoverFrame) * 4;

      nova.vx = (targetNovaX - nova.x) * 0.12;
      nova.x += nova.vx;
      nova.y += (targetNovaY - nova.y) * 0.15;
      nova.facing = nova.vx > 0.2 ? 1 : nova.vx < -0.2 ? -1 : player.facing;

      // Camera smoothly tracking player
      const targetCamX = player.x - viewW / 2;
      cameraX += (targetCamX - cameraX) * 0.1;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > worldWidth - viewW) cameraX = worldWidth - viewW;

      // Proximity check with interactive entities
      let nearest: InteractiveEntity | null = null;
      let minDist = 110;
      for (const ent of entities) {
        const entCenterX = ent.x + ent.width / 2;
        const dist = Math.abs(player.x - entCenterX);
        if (dist < minDist) {
          minDist = dist;
          nearest = ent;
        }
      }
      setActiveNearbyEntity(nearest);
      nova.scanning = !!nearest;

      // Check interaction trigger
      if (keysRef.current.interact && nearest) {
        keysRef.current.interact = false;
        sound.playScanner();
        onInteract(nearest.id);
      }

      // ==========================================
      // RENDERING PIPELINE
      // ==========================================
      ctx.clearRect(0, 0, viewW, viewH);

      // --- 1. Background Sky & Atmospheric Horizon ---
      if (isMoon) {
        // Deep Space
        const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
        skyGrad.addColorStop(0, '#03060d');
        skyGrad.addColorStop(0.7, '#070b14');
        skyGrad.addColorStop(1, '#0b101c');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, viewW, viewH);

        // Twinkling Starfield (Parallax 0.1)
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 140; i++) {
          const starX = (i * 123 + Math.sin(i * 99) * 400 - cameraX * 0.05 + worldWidth) % viewW;
          const starY = (i * 37 + Math.cos(i * 17) * 200) % (viewH * 0.7);
          const starAlpha = 0.4 + Math.sin(time + i) * 0.4;
          ctx.globalAlpha = starAlpha;
          ctx.fillRect(starX, starY, (i % 3 === 0 ? 2 : 1), (i % 3 === 0 ? 2 : 1));
        }
        ctx.globalAlpha = 1;

        // Distant Earth hanging in the Lunar Sky (Parallax 0.08)
        const earthScreenX = 720 - cameraX * 0.06;
        const earthScreenY = 130;
        // Earth glow
        const earthGlow = ctx.createRadialGradient(earthScreenX, earthScreenY, 28, earthScreenX, earthScreenY, 70);
        earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        earthGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = earthGlow;
        ctx.beginPath();
        ctx.arc(earthScreenX, earthScreenY, 70, 0, Math.PI * 2);
        ctx.fill();

        // Earth disc
        const earthDisc = ctx.createRadialGradient(earthScreenX - 8, earthScreenY - 8, 4, earthScreenX, earthScreenY, 34);
        earthDisc.addColorStop(0, '#38bdf8');
        earthDisc.addColorStop(0.5, '#0284c7');
        earthDisc.addColorStop(0.85, '#0369a1');
        earthDisc.addColorStop(1, '#0c4a6e');
        ctx.fillStyle = earthDisc;
        ctx.beginPath();
        ctx.arc(earthScreenX, earthScreenY, 34, 0, Math.PI * 2);
        ctx.fill();

        // Earth atmospheric swirl & clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(earthScreenX - 6, earthScreenY - 6, 16, 6, 0.4, 0, Math.PI * 2);
        ctx.ellipse(earthScreenX + 8, earthScreenY + 10, 14, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Distant Lunar Mountain Rim (Parallax 0.25)
        ctx.fillStyle = '#171f2f';
        ctx.beginPath();
        ctx.moveTo(0, viewH);
        for (let x = 0; x <= viewW; x += 30) {
          const worldX = x + cameraX * 0.25;
          const peakY = 320 + Math.sin(worldX * 0.003) * 45 + Math.cos(worldX * 0.009) * 20;
          ctx.lineTo(x, peakY);
        }
        ctx.lineTo(viewW, viewH);
        ctx.closePath();
        ctx.fill();

      } else {
        // --- Mars Atmosphere ---
        const marsSky = ctx.createLinearGradient(0, 0, 0, viewH);
        marsSky.addColorStop(0, '#1c0c08');
        marsSky.addColorStop(0.4, '#38160d');
        marsSky.addColorStop(0.7, '#5c2214');
        marsSky.addColorStop(1, '#83341d');
        ctx.fillStyle = marsSky;
        ctx.fillRect(0, 0, viewW, viewH);

        // Faint Moons Phobos & Deimos
        ctx.fillStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.arc(380 - cameraX * 0.03, 90, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(840 - cameraX * 0.04, 130, 4, 0, Math.PI * 2);
        ctx.fill();

        // Distant Martian Mesas & Canyon Walls (Parallax 0.2)
        ctx.fillStyle = '#42160d';
        ctx.beginPath();
        ctx.moveTo(0, viewH);
        for (let x = 0; x <= viewW; x += 40) {
          const worldX = x + cameraX * 0.2;
          const hillY = 280 + Math.sin(worldX * 0.002) * 60 + Math.cos(worldX * 0.007) * 25;
          ctx.lineTo(x, hillY);
        }
        ctx.lineTo(viewW, viewH);
        ctx.closePath();
        ctx.fill();

        // Mid-distance Dune Ridges (Parallax 0.5)
        ctx.fillStyle = '#652312';
        ctx.beginPath();
        ctx.moveTo(0, viewH);
        for (let x = 0; x <= viewW; x += 30) {
          const worldX = x + cameraX * 0.5;
          const duneY = 380 + Math.sin(worldX * 0.005) * 30 + Math.cos(worldX * 0.015) * 15;
          ctx.lineTo(x, duneY);
        }
        ctx.lineTo(viewW, viewH);
        ctx.closePath();
        ctx.fill();
      }

      // --- 2. Foreground Terrain (Camera-anchored) ---
      ctx.save();
      ctx.translate(-cameraX, 0);

      // Regolith / Sand Ground Bed
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, viewH);
      if (isMoon) {
        groundGrad.addColorStop(0, '#2e3846');
        groundGrad.addColorStop(0.3, '#1f2631');
        groundGrad.addColorStop(1, '#0e131b');
      } else {
        groundGrad.addColorStop(0, '#9e3f24');
        groundGrad.addColorStop(0.2, '#7a2f1a');
        groundGrad.addColorStop(1, '#48190d');
      }
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, worldWidth, viewH - groundY);

      // Terrain Surface Line with Craters & Bumps
      ctx.strokeStyle = isMoon ? '#475569' : '#b84a2b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= worldWidth; x += 20) {
        const bumpY = groundY + Math.sin(x * 0.04) * 3 + Math.cos(x * 0.01) * 2;
        ctx.lineTo(x, bumpY);
      }
      ctx.stroke();

      // Atmospheric Dust / Wind Streaks (Mars Storm FX)
      const windSpeed = environment === 'mars' ? 3 + stormIntensity * 8 : 0.5;
      ctx.fillStyle = environment === 'mars' ? '#ea580c' : '#94a3b8';
      particles.forEach((p) => {
        p.x -= windSpeed;
        if (p.x < 0) p.x = worldWidth;
        p.y += p.vy;
        if (p.y > groundY + 40) p.y = 80;
        ctx.globalAlpha = p.alpha * (environment === 'mars' ? 0.3 + stormIntensity * 0.6 : 0.2);
        ctx.fillRect(p.x, p.y, p.size * (environment === 'mars' ? 2.5 : 1), p.size);
      });
      ctx.globalAlpha = 1;

      // Decorative rocks & footprints on the ground
      if (isMoon) {
        // Apollo Footprints
        ctx.fillStyle = '#1e293b';
        for (let fx = 120; fx < 800; fx += 35) {
          ctx.fillRect(fx, groundY + 4 + (fx % 2 === 0 ? 3 : 8), 6, 3);
        }
      }

      // --- 3. Render Interactive Entities (NASA Hardware / Crashed Ship) ---
      entities.forEach((ent) => {
        const inView = ent.x + ent.width >= cameraX && ent.x <= cameraX + viewW;
        if (!inView) return;

        ctx.save();
        ctx.translate(ent.x, ent.y);

        if (ent.type === 'station') {
          // Apollo ALSEP Retroreflector Array
          // Base pedestal
          ctx.fillStyle = '#64748b';
          ctx.fillRect(10, 24, 40, 16);
          // 100 quartz prisms array (tilted back)
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(8, 24);
          ctx.lineTo(24, 4);
          ctx.lineTo(52, 4);
          ctx.lineTo(48, 24);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
          // Reflective sparkles
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(20, 10, 4, 4);
          ctx.fillRect(36, 12, 4, 4);

        } else if (ent.type === 'rover') {
          if (ent.id === 'sojourner') {
            // Sojourner Microrover (Small 6-wheeled rover)
            ctx.fillStyle = '#475569';
            // Rocker bogie frame
            ctx.fillRect(8, 20, 36, 10);
            // Solar panel on top
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(6, 16, 40, 4);
            // 6 wheels
            ctx.fillStyle = '#0f172a';
            [8, 20, 34, 14, 26, 40].forEach((wx, i) => {
              ctx.beginPath();
              ctx.arc(wx, 30 + (i > 2 ? 2 : 0), 4, 0, Math.PI * 2);
              ctx.fill();
            });
            // APXS sensor probe
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(40, 22, 8, 4);
            // "Barnacle Bill" Rock next to it
            ctx.fillStyle = '#573024';
            ctx.beginPath();
            ctx.moveTo(56, 34);
            ctx.lineTo(64, 18);
            ctx.lineTo(80, 22);
            ctx.lineTo(84, 34);
            ctx.closePath();
            ctx.fill();
          } else {
            // Opportunity Rover
            // Main body
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(12, 16, 48, 16);
            // Solar panels wings
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(2, 12, 68, 4);
            // Pancam mast
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(22, 12);
            ctx.lineTo(22, -6);
            ctx.stroke();
            // Camera head
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(18, -10, 8, 5);
            // 6 Rocker Bogie wheels
            ctx.fillStyle = '#1e293b';
            [10, 36, 60].forEach((wx) => {
              ctx.beginPath();
              ctx.arc(wx, 32, 6, 0, Math.PI * 2);
              ctx.fill();
            });
            // Hematite Blueberry outcrop nearby
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(76, 28, 3, 0, Math.PI * 2);
            ctx.arc(84, 31, 3.5, 0, Math.PI * 2);
            ctx.arc(80, 33, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (ent.type === 'lander') {
          // InSight Lander
          // Landed central deck
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(16, 14, 48, 16);
          // Octagonal solar arrays on left & right
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(4, 20, 14, 0, Math.PI * 2);
          ctx.arc(76, 20, 14, 0, Math.PI * 2);
          ctx.fill();
          // Tripod landing legs
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(18, 28);
          ctx.lineTo(8, 38);
          ctx.moveTo(62, 28);
          ctx.lineTo(72, 38);
          ctx.stroke();
          // SEIS Wind and Thermal Shield (WTS) metallic dome on the ground
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(94, 32, 10, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#06b6d4';
          ctx.stroke();

        } else if (ent.type === 'ship') {
          // Crashed Exploration Lander Ship
          ctx.fillStyle = '#334155';
          // Tilted hull
          ctx.beginPath();
          ctx.moveTo(10, 48);
          ctx.lineTo(30, 8);
          ctx.lineTo(95, 20);
          ctx.lineTo(110, 48);
          ctx.closePath();
          ctx.fill();
          // Cockpit canopy visor
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(35, 16, 24, 12);
          // Damaged smoking thruster bell
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(95, 26, 18, 18);
          // Smoke & Sparks
          const smokeAlpha = 0.3 + Math.sin(time * 3) * 0.2;
          ctx.fillStyle = `rgba(249, 115, 22, ${smokeAlpha})`;
          ctx.beginPath();
          ctx.arc(114, 28 + Math.sin(time * 4) * 6, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Holographic Proximity Ring when near
        const isNear = activeNearbyEntity?.id === ent.id;
        if (isNear) {
          const ringRadius = 28 + Math.sin(time * 5) * 4;
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(ent.width / 2, ent.height / 2, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Hovering Scan Prompt Tag
          ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1;
          const tagW = 90;
          ctx.fillRect(ent.width / 2 - tagW / 2, -26, tagW, 20);
          ctx.strokeRect(ent.width / 2 - tagW / 2, -26, tagW, 20);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('[E] SCAN OBJECT', ent.width / 2, -13);
        }

        ctx.restore();
      });

      // --- 4. Render NOVA Companion (Feline Bot) ---
      ctx.save();
      ctx.translate(nova.x, nova.y + hoverOffset);
      ctx.scale(nova.facing, 1);

      // Shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 22 - hoverOffset, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Scanner Cone when active
      if (nova.scanning) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(45, -16);
        ctx.lineTo(45, 16);
        ctx.closePath();
        ctx.fill();
      }

      // Small Compact White Chassis
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 4, 12, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cyber Ears
      ctx.beginPath();
      ctx.moveTo(2, -4);
      ctx.lineTo(7, -15);
      ctx.lineTo(10, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(5, -12, 2, 4);

      // Head
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(6, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Oversized Expressive Cyan Eyes
      ctx.fillStyle = nova.scanning ? '#22d3ee' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(8, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Tail with wag
      const tailWag = Math.sin(time * 6) * 4;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 4);
      ctx.quadraticCurveTo(-18, 0 + tailWag, -14, -8);
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(-14, -8, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // --- 5. Render Astronaut Player ---
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.scale(player.facing, 1);

      // Player Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 47, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Backpack / Portable Life Support System (PLSS)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-14, 8, 8, 24);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-13, 10, 6, 6);

      // Thruster micro-puff when jumping
      if (player.isJumping) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.beginPath();
        ctx.arc(-10, 36, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spacesuit Torso
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-8, 6, 16, 26);
      ctx.strokeRect(-8, 6, 16, 26);

      // Chest Control Unit
      ctx.fillStyle = '#334155';
      ctx.fillRect(-5, 12, 10, 8);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-3, 14, 2.5, 2.5);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(1, 14, 2.5, 2.5);

      // Helmet & Visor
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Reflective Gold Visor
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(3, 0, 7, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      // Visor highlight glint
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(4, -3, 2, 4);

      // Animated Legs
      const legSwing = Math.sin(player.walkFrame) * 8;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Left leg
      ctx.beginPath();
      ctx.moveTo(-4, 32);
      ctx.lineTo(-4 - legSwing * 0.8, 46);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(4, 32);
      ctx.lineTo(4 + legSwing * 0.8, 46);
      ctx.stroke();

      ctx.restore();

      ctx.restore(); // Restore Camera transform

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [environment, entities, onInteract, stormIntensity]);

  // Touch control handlers
  const handleTouchLeft = useCallback((active: boolean) => {
    keysRef.current.left = active;
  }, []);
  const handleTouchRight = useCallback((active: boolean) => {
    keysRef.current.right = active;
  }, []);
  const handleTouchJump = useCallback(() => {
    keysRef.current.jump = true;
    setTimeout(() => {
      keysRef.current.jump = false;
    }, 150);
  }, []);
  const handleTouchScan = useCallback(() => {
    if (activeNearbyEntity) {
      sound.playScanner();
      onInteract(activeNearbyEntity.id);
    }
  }, [activeNearbyEntity, onInteract]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={560}
        className="w-full h-full max-h-[82vh] object-cover cursor-crosshair"
      />

      {/* Touch / Quick Interaction Overlay Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        
        {/* Directional Pad */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onPointerDown={() => handleTouchLeft(true)}
            onPointerUp={() => handleTouchLeft(false)}
            onPointerLeave={() => handleTouchLeft(false)}
            className="w-12 h-12 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 active:bg-cyan-900 text-slate-200 flex items-center justify-center font-bold text-lg cursor-pointer"
            aria-label="Move Left"
          >
            ←
          </button>
          <button
            onPointerDown={() => handleTouchRight(true)}
            onPointerUp={() => handleTouchRight(false)}
            onPointerLeave={() => handleTouchRight(false)}
            className="w-12 h-12 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 active:bg-cyan-900 text-slate-200 flex items-center justify-center font-bold text-lg cursor-pointer"
            aria-label="Move Right"
          >
            →
          </button>
          <button
            onClick={handleTouchJump}
            className="w-12 h-12 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 active:bg-cyan-900 text-slate-200 flex items-center justify-center font-mono text-xs cursor-pointer ml-1"
            aria-label="Jump"
          >
            JUMP
          </button>
        </div>

        {/* Scan & Action Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {activeNearbyEntity && (
            <button
              onClick={handleTouchScan}
              className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wider font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse cursor-pointer"
            >
              <span>SCAN [E]</span>
              <span className="text-[10px] bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded">
                {activeNearbyEntity.name}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
