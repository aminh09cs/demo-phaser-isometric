import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.spritesheet("bird", "assets/chars/birdSprite.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image("tiles1", "assets/tiles/outside.png");
    this.load.image("tiles2", "assets/tiles/building.png");
    this.load.tilemapTiledJSON("map", "assets/tiles/isomap.json");
  }

  create() {
    this.add
      .text(400, 300, `Moving Isometric ...`, {
        fontSize: "32px",
      })
      .setOrigin(0.5);
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.start("MainScene");
      },
      callbackScope: this,
      loop: false,
    });
  }
}

export default PreloadScene;
