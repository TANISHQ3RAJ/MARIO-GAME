import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private isFlipped = false;
  private lastFlipTime = 0;
  
  // Stats
  private distanceTravelled = 0;
  private coinsCollected = 0;
  private gravityFlips = 0;
  private levelReached = 1;
  private startTime = 0;

  // UI Texts
  private scoreText!: Phaser.GameObjects.Text;
  private multiplierText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Generate placeholder assets programmatically
    const graphics = this.add.graphics();
    
    // Player
    graphics.fillStyle(0xE52521, 1);
    graphics.fillRect(0, 0, 32, 48);
    graphics.generateTexture('player', 32, 48);
    graphics.clear();

    // Platform
    graphics.fillStyle(0x43B047, 1);
    graphics.fillRect(0, 0, 400, 32);
    graphics.generateTexture('platform', 400, 32);
    graphics.clear();

    // Coin
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('coin', 24, 24);
    graphics.clear();

    // Spike (Enemy Placeholder)
    graphics.fillStyle(0x049CD8, 1);
    graphics.fillTriangle(16, 0, 0, 32, 32, 32);
    graphics.generateTexture('enemy', 32, 32);
    graphics.clear();
  }

  create() {
    this.startTime = this.time.now;
    this.distanceTravelled = 0;
    this.coinsCollected = 0;
    this.gravityFlips = 0;
    this.isFlipped = false;

    // Reset physics world gravity to normal
    this.physics.world.gravity.y = 800;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Create World Bounds
    this.physics.world.setBounds(0, -500, Number.MAX_SAFE_INTEGER, 1540);

    // Initial Platforms
    this.platforms = this.physics.add.staticGroup();
    this.createPlatform(480, 500);
    this.createPlatform(1000, 400);
    this.createPlatform(1500, 100); // Ceiling platform

    // Coins
    this.coins = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.spawnCoin(600, 300);

    // Player
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setFollowOffset(-200, 0);

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin as any, undefined, this);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.on('keydown-SPACE', this.flipGravity, this);
    }
    this.input.on('pointerdown', this.flipGravity, this);

    // UI
    this.scoreText = this.add.text(16, 16, 'Coins: 0', { fontSize: '20px', color: '#FFF', fontFamily: 'monospace' }).setScrollFactor(0);
    this.multiplierText = this.add.text(16, 40, 'Multi: 1.0x', { fontSize: '20px', color: '#c084fc', fontFamily: 'monospace' }).setScrollFactor(0);
  }

  createPlatform(x: number, y: number) {
    const platform = this.platforms.create(x, y, 'platform');
    // Enable collision from all sides so player can walk on ceiling
    platform.body.checkCollision.up = true;
    platform.body.checkCollision.down = true;
    platform.body.checkCollision.left = true;
    platform.body.checkCollision.right = true;
    return platform;
  }

  spawnCoin(x: number, y: number) {
    this.coins.create(x, y, 'coin');
  }

  collectCoin(_player: Phaser.Physics.Arcade.Sprite, coin: Phaser.Physics.Arcade.Sprite) {
    coin.disableBody(true, true);
    this.coinsCollected += 1;
    this.updateUI();
  }

  flipGravity() {
    const now = this.time.now;
    if (now - this.lastFlipTime < 300) return; // Cooldown
    
    this.isFlipped = !this.isFlipped;
    this.lastFlipTime = now;
    this.gravityFlips += 1;

    if (this.isFlipped) {
      this.physics.world.gravity.y = -800;
      this.player.setFlipY(true);
    } else {
      this.physics.world.gravity.y = 800;
      this.player.setFlipY(false);
    }
    
    // Add some visual flair
    this.cameras.main.flash(100, 255, 255, 255);
    this.updateUI();
  }

  update() {
    if (!this.player.active) return;

    // Movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // Auto scroll / endless runner push
    // this.player.x += 2; // Simple forward momentum

    // Jump
    const isGrounded = this.isFlipped ? this.player.body?.blocked.up : this.player.body?.blocked.down;
    if (this.cursors.up.isDown && isGrounded) {
      this.player.setVelocityY(this.isFlipped ? 500 : -500);
    }

    // Track Distance
    if (this.player.x > this.distanceTravelled) {
      this.distanceTravelled = this.player.x;
    }

    // Generate endless platforms ahead
    this.platforms.getChildren().forEach((p: any) => {
      if (p.x < this.cameras.main.scrollX - 400) {
        p.x = this.cameras.main.scrollX + 1200 + Phaser.Math.Between(0, 300);
        p.y = Phaser.Math.Between(100, 450);
        p.body.updateFromGameObject();

        // Spawn coin randomly
        if (Phaser.Math.Between(0, 100) > 50) {
          this.spawnCoin(p.x, p.y + (Phaser.Math.Between(0, 1) === 0 ? 100 : -100));
        }
      }
    });

    // Game Over condition (falling out of bounds)
    if (this.player.y > 700 || this.player.y < -200) {
      this.triggerGameOver();
    }
  }

  updateUI() {
    this.scoreText.setText(`Coins: ${this.coinsCollected}`);
    const multi = Math.min(1 + this.gravityFlips * 0.1, 3.0);
    this.multiplierText.setText(`Multi: ${multi.toFixed(1)}x`);
  }

  triggerGameOver() {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.active = false;

    const durationSeconds = Math.floor((this.time.now - this.startTime) / 1000);
    const distanceMeters = Math.floor(this.distanceTravelled / 100);
    
    // Calculate Score based on formula
    const baseScore = (distanceMeters * 10) + (this.coinsCollected * 50) + (this.levelReached * 500);
    const multiplier = Math.min(1 + (this.gravityFlips * 0.1), 3.0);
    const finalScore = Math.round(baseScore * multiplier);

    const onGameOver = this.registry.get('onGameOver');
    if (onGameOver) {
      onGameOver({
        score: finalScore,
        level_reached: this.levelReached,
        coins_collected: this.coinsCollected,
        gravity_flips: this.gravityFlips,
        duration_seconds: durationSeconds,
        distance_travelled: distanceMeters
      });
    }
  }
}
