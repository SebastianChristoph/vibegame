import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import useGameStore from '../store/gameStore';
import ProductionSelector from './ProductionSelector';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.modules = [];
    this.selectedModule = null;
    this.mainComputer = null;
    this.productionText = null;
    this.productionRateText = null;
    this.isAnimating = false;
    this.currentProductionMode = 'scripts';
    this.viruses = [];
    this.nextVirusSpawn = 0;
    this.virusSpawnRate = 1500;
    this.activeFirewalls = new Set(); // Keep track of active firewalls
    this.computerSize = 150; // Reduced from 200 (25% smaller)
  }

  createRamBar() {
    const barWidth = this.computerSize * 0.8;
    const barHeight = 16;
    const x = this.mainComputer.x - barWidth/2;
    const y = this.mainComputer.y - this.computerSize/4;

    // Create container rectangle with border
    this.ramBarContainer = this.add.rectangle(x + barWidth/2, y, barWidth, barHeight, 0x001B34);
    this.ramBarContainer.setStrokeStyle(1, 0x0099FF);
    this.ramBarContainer.setDepth(1);

    // Create the dark blue background (available RAM)
    this.ramBarAvailable = this.add.rectangle(x, y, barWidth, barHeight, 0x002B44);
    this.ramBarAvailable.setOrigin(0, 0.5);
    this.ramBarAvailable.setDepth(1);
    
    // Create the blue overlay (used RAM)
    this.ramBarUsed = this.add.rectangle(x, y, 0, barHeight, 0x0066CC);
    this.ramBarUsed.setOrigin(0, 0.5);
    this.ramBarUsed.setDepth(1);

    // Add RAM text
    this.ramText = this.add.text(
      x + barWidth/2,
      y,
      '4/4GB',
      {
        font: 'bold 12px monospace',
        fill: '#FFFFFF',
        align: 'center'
      }
    );
    this.ramText.setOrigin(0.5);
    this.ramText.setDepth(2);
  }

  updateRamBar() {
    const baseRAM = 4;
    const additionalRAM = this.modules.filter(m => m.type === 'ram').length * 2;
    const totalRAM = baseRAM + additionalRAM;
    const usedByFirewalls = this.modules.filter(m => m.type === 'firewall').length * 2;
    const availableRAM = totalRAM - usedByFirewalls;

    const barWidth = 140;  // Match the width from createRamBar
    const usedWidth = Math.max(0, barWidth * (usedByFirewalls/totalRAM));

    // Update the blue bar (used RAM)
    this.ramBarUsed.width = usedWidth;

    // Update the text
    this.ramText.setText(`${availableRAM}/${totalRAM}GB`);

    // Update production rate
    const rate = Math.floor(availableRAM / 2);
    this.productionRateText.setText(`${rate} units/sec`);
  }

  updateProductionDisplay(mode) {
    if (this.productionText) {
      const icons = {
        crypto: '⚡',
        research: '🔬',
        scripts: '📜'
      };
      const names = {
        crypto: 'Crypto',
        research: 'Research',
        scripts: 'Scripts'
      };
      this.currentProductionMode = mode;
      this.productionText.setText(`${icons[mode]} ${names[mode]}`);
    }
  }

  spawnVirus() {
    // Randomly choose a side to spawn from
    const side = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    switch(side) {
      case 0: // top
        x = Phaser.Math.Between(100, 700);
        y = 50;
        break;
      case 1: // right
        x = 750;
        y = Phaser.Math.Between(100, 500);
        break;
      case 2: // bottom
        x = Phaser.Math.Between(100, 700);
        y = 550;
        break;
      case 3: // left
        x = 50;
        y = Phaser.Math.Between(100, 500);
        break;
    }

    const virus = this.add.circle(x, y, 4, 0xff0000);
    const angle = Phaser.Math.Angle.Between(
      x, y,
      this.mainComputer.x, this.mainComputer.y
    );
    
    const speed = 100; // pixels per second
    const velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };

    this.viruses.push({
      sprite: virus,
      velocity: velocity
    });
  }

  updateFirewallRadius(module) {
    // Clear any existing radius
    if (module.detectionRadius) {
      module.detectionRadius.destroy();
      module.detectionRadius = null;
    }

    // If this is a firewall, create new radius
    if (module.type === 'firewall') {
      const radius = this.add.circle(module.x, module.y, this.computerSize * 0.9, 0x0099FF, 0.15);
      radius.setStrokeStyle(1, 0x0099FF, 0.4);
      radius.setDepth(-2);
      module.detectionRadius = radius;
      module.isActive = true;
    }
  }

  createFireBeam(startX, startY, targetX, targetY) {
    // Create a container for multiple fire lines
    const lines = [];
    const numLines = 3; // Number of parallel fire lines
    const spread = 6; // How far the lines spread from center
    
    for (let i = 0; i < numLines; i++) {
      const line = this.add.graphics();
      line.setDepth(10); // Set high depth to appear above other elements
      lines.push(line);
    }
    
    // Create a tween to animate the fire effect
    const pulseWidth = {value: 3};
    this.tweens.add({
      targets: pulseWidth,
      value: 8,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        lines.forEach((line, index) => {
          line.clear();
          
          // Calculate offset for this line
          const offset = (index - (numLines - 1) / 2) * spread;
          
          // Calculate perpendicular vector for offset
          const dx = targetX - startX;
          const dy = targetY - startY;
          const len = Math.sqrt(dx * dx + dy * dy);
          const perpX = -dy / len;
          const perpY = dx / len;
          
          // Calculate offset points
          const startOffsetX = startX + perpX * offset;
          const startOffsetY = startY + perpY * offset;
          const targetOffsetX = targetX + perpX * offset;
          const targetOffsetY = targetY + perpY * offset;
          
          // Use different colors for each line
          const colors = [0x0099FF, 0x00CCFF, 0x66FFFF];
          const alpha = 0.7 - Math.abs(index - 1) * 0.2; // Center line is brightest
          
          line.lineStyle(pulseWidth.value * (1 - Math.abs(index - 1) * 0.3), colors[index], alpha);
          line.beginPath();
          line.moveTo(startOffsetX, startOffsetY);
          
          // Add some waviness to the line
          const segments = 5;
          for (let j = 1; j <= segments; j++) {
            const t = j / segments;
            const waveAmplitude = Math.sin(t * Math.PI) * 4;
            const waveX = startOffsetX + (targetOffsetX - startOffsetX) * t + 
                         perpX * Math.sin(t * Math.PI * 4 + this.time.now * 0.01) * waveAmplitude;
            const waveY = startOffsetY + (targetOffsetY - startOffsetY) * t + 
                         perpY * Math.sin(t * Math.PI * 4 + this.time.now * 0.01) * waveAmplitude;
            line.lineTo(waveX, waveY);
          }
          
          line.strokePath();
        });
      }
    });

    // Remove the lines after 2.5 seconds
    this.time.delayedCall(2500, () => {
      lines.forEach(line => line.destroy());
    });

    return 2500;
  }

  createBurningAnimation(x, y) {
    // Create central explosion
    const explosion = this.add.particles(x, y, 'particle', {
      lifespan: { min: 600, max: 800 },
      quantity: 2,
      frequency: 30,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0x0099FF, 0x0066CC, 0x00CCFF],
      speed: { min: 50, max: 80 },
      angle: { min: 0, max: 360 },
      gravityY: -50,
      emitting: true
    });

    // Create rising flames
    const flames = [];
    const numFlames = 12;
    for (let i = 0; i < numFlames; i++) {
      const angle = (i / numFlames) * 360;
      const flame = this.add.particles(x, y, 'particle', {
        lifespan: { min: 400, max: 600 },
        quantity: 1,
        frequency: 40,
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: [0x0099FF, 0x0066CC],
        speed: { min: 60, max: 100 },
        angle: { min: angle - 10, max: angle + 10 },
        gravityY: -80,
        emitting: true
      });
      flames.push(flame);
    }

    // Create sparks
    const sparks = this.add.particles(x, y, 'particle', {
      lifespan: { min: 300, max: 500 },
      quantity: 3,
      frequency: 20,
      scale: { start: 0.1, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0x00CCFF,
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      gravityY: -20,
      emitting: true
    });

    // Stop emitting after a short time
    this.time.delayedCall(400, () => {
      explosion.emitting = false;
      flames.forEach(flame => flame.emitting = false);
      sparks.emitting = false;
    });

    // Clean up after animation
    this.time.delayedCall(1000, () => {
      explosion.destroy();
      flames.forEach(flame => flame.destroy());
      sparks.destroy();
    });

    return 1000;
  }

  checkVirusCollisions() {
    // Check each virus against firewalls and main computer
    for (let i = this.viruses.length - 1; i >= 0; i--) {
      const virus = this.viruses[i];
      
      // If virus is marked as being destroyed but still exists after 3 seconds, clean it up
      if (virus.isBeingDestroyed && virus.destroyStartTime && (this.time.now - virus.destroyStartTime > 3000)) {
        virus.sprite.destroy();
        this.viruses.splice(i, 1);
        continue;
      }
      
      // Skip if virus is already being destroyed
      if (virus.isBeingDestroyed) continue;
      
      // Check collision with main computer
      const distanceToMain = Phaser.Math.Distance.Between(
        virus.sprite.x, virus.sprite.y,
        this.mainComputer.x, this.mainComputer.y
      );
      
      if (distanceToMain < 100) {
        virus.sprite.destroy();
        this.viruses.splice(i, 1);
        continue;
      }

      // Check collision with active firewalls
      for (const module of this.modules) {
        if (module.type === 'firewall') {
          const distanceToFirewall = Phaser.Math.Distance.Between(
            virus.sprite.x, virus.sprite.y,
            module.x, module.y
          );
          
          // Only process collision if firewall is active and virus is within range
          if (module.isActive && distanceToFirewall < 180) {
            // 1. Mark virus as being destroyed and freeze it
            virus.isBeingDestroyed = true;
            virus.destroyStartTime = this.time.now;
            virus.velocity.x = 0;
            virus.velocity.y = 0;
            
            // 2. Deactivate firewall immediately (2.5 second cooldown starts now)
            module.isActive = false;
            if (module.detectionRadius) {
              module.detectionRadius.setVisible(false);
            }
            if (module.typeText) {
              module.typeText.setColor('#ff0000');
            }
            
            // Store references for cleanup
            const virusIndex = i;
            const virusRef = virus;
            
            // 3. Shoot fire beam and destroy virus
            const beamDuration = this.createFireBeam(
              module.x, 
              module.y, 
              virus.sprite.x, 
              virus.sprite.y
            );
            
            // Store reactivation timer for potential cleanup
            module.reactivationTimer = this.time.delayedCall(2500, () => {
              // Only reactivate if module still exists and is still a firewall
              if (module && module.type === 'firewall') {
                module.isActive = true;
                if (module.detectionRadius) {
                  module.detectionRadius.setVisible(true);
                }
                if (module.typeText) {
                  module.typeText.setColor('#000000');
                }
              }
            });
            
            // 4. Create explosion and destroy virus after beam
            this.time.delayedCall(beamDuration, () => {
              // Check if virus still exists before trying to destroy it
              if (this.viruses.includes(virusRef)) {
                this.createBurningAnimation(virusRef.sprite.x, virusRef.sprite.y);
                virusRef.sprite.destroy();
                const currentIndex = this.viruses.indexOf(virusRef);
                if (currentIndex !== -1) {
                  this.viruses.splice(currentIndex, 1);
                }
              }
            });
            
            break;
          }
        }
      }
    }
  }

  updateModule(moduleIndex, type) {
    if (this.modules[moduleIndex]) {
      const module = this.modules[moduleIndex];
      
      // If removing a firewall, clean up its effects
      if (module.type === 'firewall') {
        if (module.reactivationTimer) {
          module.reactivationTimer.remove();
          module.reactivationTimer = null;
        }
        if (module.flames) {
          module.flames.forEach(flame => flame.destroy());
          module.flames = null;
        }
        if (module.detectionRadius) {
          module.detectionRadius.destroy();
          module.detectionRadius = null;
        }
      }

      // Update module properties
      if (type) {
        module.fillColor = 0x0066CC;
        module.occupied = true;
        module.type = type;
        module.setDepth(0);
        
        if (!module.typeText) {
          let displayText = type.toUpperCase();
          if (type === 'ram') {
            displayText = '+2GB';
          } else if (type === 'firewall') {
            displayText = 'FW\n-2GB';
          }
          module.typeText = this.add.text(
            module.x,
            module.y,
            displayText,
            {
              font: type === 'firewall' ? '12px/14px monospace' : '12px monospace',
              fill: '#FFFFFF',
              align: 'center'
            }
          );
          module.typeText.setOrigin(0.5);
          module.typeText.setDepth(1);
        } else {
          let displayText = type.toUpperCase();
          if (type === 'ram') {
            displayText = '+2GB';
          } else if (type === 'firewall') {
            displayText = 'FW\n-2GB';
          }
          module.typeText.setText(displayText);
        }
      } else {
        module.fillColor = 0x001B34;
        module.occupied = false;
        module.type = null;
        module.setDepth(0);
        if (module.typeText) {
          module.typeText.destroy();
          module.typeText = null;
        }
      }

      // Update firewall radius and effects
      this.updateFirewallRadius(module);

      // Update RAM display
      this.updateRamBar();
    }
  }

  updateTotalRAM(modules) {
    if (this.ramText) {
      const baseRAM = 4;
      const additionalRAM = modules.filter(m => m.type === 'ram').length * 2;
      const totalRAM = baseRAM + additionalRAM;
      const usedByFirewalls = modules.filter(m => m.type === 'firewall').length * 2;
      const availableRAM = totalRAM - usedByFirewalls;
      this.ramText.setText(`${availableRAM}/${totalRAM}GB RAM`);
      
      // Update production rate based on available RAM
      const rate = Math.floor(availableRAM / 2);
      this.productionRateText.setText(`${rate} units/sec`);
      this.game.events.emit('productionRateChanged', rate);
    }
  }

  update(time) {
    // Spawn new viruses
    if (time > this.nextVirusSpawn) {
      this.spawnVirus();
      this.nextVirusSpawn = time + this.virusSpawnRate;
    }

    // Update virus positions
    for (const virus of this.viruses) {
      virus.sprite.x += virus.velocity.x * (this.game.loop.delta / 1000);
      virus.sprite.y += virus.velocity.y * (this.game.loop.delta / 1000);
    }

    // Check for collisions
    this.checkVirusCollisions();
  }

  create() {
    // Create particle texture
    const particleTexture = this.add.graphics();
    particleTexture.fillStyle(0xffffff);
    particleTexture.fillCircle(4, 4, 4);
    particleTexture.generateTexture('particle', 8, 8);
    particleTexture.destroy();

    // Create the main computer background (darker shade)
    this.mainComputerBg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.computerSize,
      this.computerSize,
      0x002244
    );
    this.mainComputerBg.setDepth(0);

    // Create the main computer (central target)
    this.mainComputer = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.computerSize,
      this.computerSize,
      0x003366
    );
    this.mainComputer.setInteractive();
    this.mainComputer.setDepth(0);
    this.mainComputer.setAlpha(0.9);

    // Add server/CPU visual elements
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x0099FF, 0.2);

    // Add grid pattern
    for (let i = -this.computerSize/2; i <= this.computerSize/2; i += this.computerSize/5) {
      graphics.beginPath();
      graphics.moveTo(this.mainComputer.x - this.computerSize/2, this.mainComputer.y + i);
      graphics.lineTo(this.mainComputer.x + this.computerSize/2, this.mainComputer.y + i);
      graphics.strokePath();

      graphics.beginPath();
      graphics.moveTo(this.mainComputer.x + i, this.mainComputer.y - this.computerSize/2);
      graphics.lineTo(this.mainComputer.x + i, this.mainComputer.y + this.computerSize/2);
      graphics.strokePath();
    }

    // Add circuit-like patterns
    graphics.lineStyle(2, 0x0066CC, 0.3);
    
    // Horizontal lines
    const offset = this.computerSize * 0.3;
    graphics.beginPath();
    graphics.moveTo(this.mainComputer.x - this.computerSize/2 + 10, this.mainComputer.y - offset);
    graphics.lineTo(this.mainComputer.x + this.computerSize/2 - 10, this.mainComputer.y - offset);
    graphics.strokePath();

    graphics.beginPath();
    graphics.moveTo(this.mainComputer.x - this.computerSize/2 + 10, this.mainComputer.y + offset);
    graphics.lineTo(this.mainComputer.x + this.computerSize/2 - 10, this.mainComputer.y + offset);
    graphics.strokePath();

    // Vertical lines
    graphics.beginPath();
    graphics.moveTo(this.mainComputer.x - offset, this.mainComputer.y - this.computerSize/2 + 10);
    graphics.lineTo(this.mainComputer.x - offset, this.mainComputer.y + this.computerSize/2 - 10);
    graphics.strokePath();

    graphics.beginPath();
    graphics.moveTo(this.mainComputer.x + offset, this.mainComputer.y - this.computerSize/2 + 10);
    graphics.lineTo(this.mainComputer.x + offset, this.mainComputer.y + this.computerSize/2 - 10);
    graphics.strokePath();

    // Add corner accents
    const cornerSize = 15;
    const corners = [
      { x: -this.computerSize/2, y: -this.computerSize/2 },
      { x: this.computerSize/2, y: -this.computerSize/2 },
      { x: this.computerSize/2, y: this.computerSize/2 },
      { x: -this.computerSize/2, y: this.computerSize/2 }
    ];

    graphics.lineStyle(2, 0x0066CC, 0.4);
    corners.forEach(corner => {
      graphics.beginPath();
      graphics.moveTo(this.mainComputer.x + corner.x, this.mainComputer.y + corner.y);
      graphics.lineTo(this.mainComputer.x + corner.x + (corner.x < 0 ? cornerSize : -cornerSize), this.mainComputer.y + corner.y);
      graphics.strokePath();

      graphics.beginPath();
      graphics.moveTo(this.mainComputer.x + corner.x, this.mainComputer.y + corner.y);
      graphics.lineTo(this.mainComputer.x + corner.x, this.mainComputer.y + corner.y + (corner.y < 0 ? cornerSize : -cornerSize));
      graphics.strokePath();
    });

    graphics.setDepth(1);

    // Create the RAM bar
    this.createRamBar();

    // Add production rate in the middle
    this.productionRateText = this.add.text(
      this.mainComputer.x,
      this.mainComputer.y,
      '2 units/sec',
      {
        font: '14px monospace',
        fill: '#FFFFFF',
        align: 'center'
      }
    );
    this.productionRateText.setOrigin(0.5);
    this.productionRateText.setDepth(2);

    // Add production type text with icon
    this.productionText = this.add.text(
      this.mainComputer.x,
      this.mainComputer.y + this.computerSize/4,
      '📜 Scripts',
      {
        font: '14px monospace',
        fill: '#FFFFFF',
        align: 'center'
      }
    );
    this.productionText.setOrigin(0.5);
    this.productionText.setDepth(2);
    this.productionText.setInteractive();

    // Handle clicks on production text or computer
    this.mainComputer.on('pointerdown', () => {
      this.game.events.emit('toggleProductionMenu');
    });

    this.productionText.on('pointerdown', () => {
      this.game.events.emit('toggleProductionMenu');
    });

    // Create module positions (2 on each side)
    const modulePositions = [
      // Top side
      { x: this.mainComputer.x - this.computerSize/4, y: this.mainComputer.y - this.computerSize*0.7 },
      { x: this.mainComputer.x + this.computerSize/4, y: this.mainComputer.y - this.computerSize*0.7 },
      // Right side
      { x: this.mainComputer.x + this.computerSize*0.7, y: this.mainComputer.y - this.computerSize/4 },
      { x: this.mainComputer.x + this.computerSize*0.7, y: this.mainComputer.y + this.computerSize/4 },
      // Bottom side
      { x: this.mainComputer.x + this.computerSize/4, y: this.mainComputer.y + this.computerSize*0.7 },
      { x: this.mainComputer.x - this.computerSize/4, y: this.mainComputer.y + this.computerSize*0.7 },
      // Left side
      { x: this.mainComputer.x - this.computerSize*0.7, y: this.mainComputer.y + this.computerSize/4 },
      { x: this.mainComputer.x - this.computerSize*0.7, y: this.mainComputer.y - this.computerSize/4 }
    ];

    // Create modules
    this.modules = modulePositions.map((pos, index) => {
      const module = this.add.rectangle(pos.x, pos.y, 35, 35, 0x001B34);
      module.setStrokeStyle(1, 0x0099FF);
      module.setInteractive();
      module.index = index;
      module.occupied = false;
      module.type = null;
      
      module.on('pointerover', () => {
        if (!module.occupied) {
          module.fillColor = 0x002B44;
        }
      });
      
      module.on('pointerout', () => {
        if (!module.occupied) {
          module.fillColor = 0x001B34;
        }
      });
      
      module.on('pointerdown', () => {
        this.game.events.emit('moduleSelected', module.index);
      });
      
      return module;
    });

    // Start virus spawning
    this.nextVirusSpawn = this.time.now + this.virusSpawnRate;
  }

  pulseMainComputer() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const originalScaleX = this.mainComputer.scaleX;
    const originalScaleY = this.mainComputer.scaleY;

    this.tweens.add({
      targets: [this.mainComputer, this.ramText, this.productionText, this.productionRateText],
      scaleX: originalScaleX * 1.02, // More subtle pulse
      scaleY: originalScaleY * 1.02,
      duration: 150, // Slightly longer duration
      yoyo: true,
      ease: 'Sine.easeInOut', // Smoother easing
      onComplete: () => {
        this.mainComputer.setScale(originalScaleX, originalScaleY);
        this.ramText.setScale(1);
        this.productionText.setScale(1);
        this.productionRateText.setScale(1);
        this.isAnimating = false;
      }
    });
  }
}

const BuildingSelection = ({ moduleId, onClose, onBuild }) => {
  const { 
    crypto, 
    buildingCosts, 
    buildingSpecs,
    buildOnModule, 
    removeModule, 
    mainComputer,
    getTotalRAM,
    hasEnoughRAM,
    getAvailableRAM 
  } = useGameStore();
  
  const currentModule = mainComputer.modules[moduleId];
  const currentRAM = getTotalRAM();
  const availableRAM = getAvailableRAM();

  const handleBuild = (type) => {
    buildOnModule(moduleId, type);
    onBuild(moduleId, type);
    onClose();
  };

  const handleRemove = () => {
    removeModule(moduleId);
    onBuild(moduleId, null);
    onClose();
  };

  const getButtonDisabled = (type) => {
    const cost = buildingCosts[type] - (currentModule.type ? Math.floor(buildingCosts[currentModule.type] / 2) : 0);
    
    // For firewall, check if we have enough available RAM (not total RAM)
    if (type === 'firewall') {
      return crypto < cost || availableRAM < 2;
    }
    
    // For RAM modules, check total RAM impact
    let totalRamChange = buildingSpecs[type].provides - buildingSpecs[type].requires;
    
    // If replacing a module, consider its current RAM impact
    if (currentModule.type) {
      if (currentModule.type === 'ram') {
        totalRamChange -= buildingSpecs.ram.provides;
      }
      if (currentModule.type === 'firewall') {
        totalRamChange += buildingSpecs.firewall.requires;
      }
    }

    const finalRAM = currentRAM + totalRamChange;
    return crypto < cost || finalRAM < 0;
  };

  return (
    <div 
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: '#000000',
        border: '2px solid #0099FF',
        padding: '1rem',
        zIndex: 1000,
        minWidth: '200px'
      }}
    >
      <h3 style={{ color: '#0099FF', margin: '0 0 1rem 0', textAlign: 'center' }}>
        {currentModule.type ? 'Modify Module' : 'Build on Module'}
      </h3>
      <div style={{ color: '#0099FF', marginBottom: '1rem', textAlign: 'center', fontFamily: 'monospace' }}>
        Available RAM: {currentRAM}GB
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => handleBuild('ram')}
          disabled={getButtonDisabled('ram')}
          style={{
            backgroundColor: !getButtonDisabled('ram') ? 'rgba(0, 102, 204, 0.4)' : '#333333',
            color: '#0099FF',
            border: 'none',
            padding: '0.5rem',
            cursor: !getButtonDisabled('ram') ? 'pointer' : 'not-allowed',
            fontFamily: 'monospace'
          }}
        >
          RAM (+2GB) - {buildingCosts.ram - (currentModule.type ? Math.floor(buildingCosts[currentModule.type] / 2) : 0)} Crypto
        </button>
        <button
          onClick={() => handleBuild('firewall')}
          disabled={getButtonDisabled('firewall')}
          style={{
            backgroundColor: !getButtonDisabled('firewall') ? 'rgba(0, 102, 204, 0.4)' : '#333333',
            color: '#0099FF',
            border: 'none',
            padding: '0.5rem',
            cursor: !getButtonDisabled('firewall') ? 'pointer' : 'not-allowed',
            fontFamily: 'monospace'
          }}
        >
          Firewall (-2GB RAM) - {buildingCosts.firewall - (currentModule.type ? Math.floor(buildingCosts[currentModule.type] / 2) : 0)} Crypto
        </button>
        {currentModule.type && (
          <button
            onClick={handleRemove}
            style={{
              backgroundColor: '#ff0000',
              color: '#000000',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Remove (+{Math.floor(buildingCosts[currentModule.type] / 2)} Crypto)
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#333333',
            color: '#0099FF',
            border: '1px solid #0099FF',
            padding: '0.5rem',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const GameCanvas = () => {
  const gameRef = useRef(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showProductionMenu, setShowProductionMenu] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const gameStarted = useGameStore((state) => state.gameStarted);
  const mainComputer = useGameStore((state) => state.mainComputer);
  const produce = useGameStore((state) => state.produce);
  const setProductionMode = useGameStore((state) => state.setProductionMode);
  const productionMode = useGameStore((state) => state.productionMode);
  const getAvailableRAM = useGameStore((state) => state.getAvailableRAM);
  const getTotalRAM = useGameStore((state) => state.getTotalRAM);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 40 // Subtract navbar height
      });
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight - 40);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Production interval
  useEffect(() => {
    const productionInterval = setInterval(() => {
      produce();
    }, 1000);

    return () => clearInterval(productionInterval);
  }, [produce]);

  // Update production display when mode changes
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      scene.updateProductionDisplay(productionMode);
    }
  }, [productionMode]);

  // Update RAM display when modules change
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      scene.updateRamBar();
    }
  }, [mainComputer.modules]);

  // Initial setup
  useEffect(() => {
    if (!gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: '#000000',
        scene: MainScene,
        parent: 'game-container',
        scale: {
          mode: Phaser.Scale.RESIZE,
          width: '100%',
          height: '100%'
        },
        physics: {
          default: 'arcade',
          arcade: {
            debug: false
          }
        }
      };

      const game = new Phaser.Game(config);
      gameRef.current = game;
      window.game = game;

      game.events.on('moduleSelected', (moduleIndex) => {
        setSelectedModule(moduleIndex);
      });

      game.events.on('toggleProductionMenu', () => {
        setShowProductionMenu(prev => !prev);
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        window.game = null;
      }
    };
  }, []);

  // Update modules when state changes
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      mainComputer.modules.forEach((module, index) => {
        scene.updateModule(index, module.type);
      });
      scene.updateTotalRAM(mainComputer.modules);
    }
  }, [mainComputer.modules]);

  const handleBuild = (moduleId, type) => {
    if (window.game && window.game.scene.scenes[0]) {
      const scene = window.game.scene.scenes[0];
      scene.updateModule(moduleId, type);
      scene.updateTotalRAM(mainComputer.modules);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 40px)' }}>
      <div 
        id="game-container" 
        style={{ 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }}
      />
      {selectedModule !== null && (
        <BuildingSelection
          moduleId={selectedModule}
          onClose={() => setSelectedModule(null)}
          onBuild={handleBuild}
        />
      )}
      {showProductionMenu && (
        <ProductionSelector 
          onClose={() => setShowProductionMenu(false)} 
        />
      )}
    </div>
  );
};

export default GameCanvas; 