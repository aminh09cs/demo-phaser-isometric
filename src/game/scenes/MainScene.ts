import Phaser from "phaser";
import EasyStar from "easystarjs";

//interfaces
declare interface EasyStar {
  setGrid(grid: number[][], callback?: () => void): void;
  setAcceptableTiles(acceptableTiles: number[]): void;
  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    callback: (path: { x: number; y: number }[]) => void
  ): void;
  calculate(): void;
  avoidAdditionalPoint(x: number, y: number): void;
}

class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }
  private CURRENT_PLAYER_POSITION: {
    x: number;
    y: number;
  } = { x: 1, y: 1 };
  private NEXT_PLAYER_POSITION: {
    x: number;
    y: number;
  } = { x: 1, y: 1 };

  private player!: any;
  private easystar!: EasyStar | undefined;
  private map!: Phaser.Tilemaps.Tilemap | undefined;
  private ground!: Phaser.Tilemaps.TilemapLayer | any;
  private layer1!: Phaser.Tilemaps.TilemapLayer | any;
  private layer2!: Phaser.Tilemaps.TilemapLayer | any;
  private layer3!: Phaser.Tilemaps.TilemapLayer | any;
  private pathStar: any;
  private frameTime: number = 0;

  create() {
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", {
        start: 9,
        end: 15,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.createMap();
    this.createPlayer();
    this.createCamera();
    this.createEasyStar();

    this.handleInputs();
  }

  createMap() {
    this.map = this.add.tilemap("map");

    const tileset1 = this.map.addTilesetImage("iso-64x64-outside", "tiles1");
    const tileset2 = this.map.addTilesetImage("iso-64x64-building", "tiles2");
    if (!tileset1 || !tileset2) return;

    this.ground = this.map.createLayer("Ground", [tileset1, tileset2]);
    this.layer1 = this.map.createLayer("Layer1", [tileset1, tileset2]);
    this.layer2 = this.map.createLayer("Layer2", [tileset1, tileset2]);
    this.layer3 = this.map.createLayer("Layer3", [tileset1, tileset2]);

    this.ground?.setDepth(0);
    this.layer1?.setDepth(2);
    this.layer2?.setDepth(2);
    this.layer3?.setDepth(2);
  }
  createCamera() {
    this.cameras.main.startFollow(this.player);
  }

  createPlayer() {
    let player_position: Phaser.Tilemaps.Tile | undefined =
      this.ground?.getTileAt(
        this.CURRENT_PLAYER_POSITION.x,
        this.CURRENT_PLAYER_POSITION.y
      );
    if (player_position) {
      this.player = this.add
        .sprite(player_position.pixelX, player_position.pixelY, "bird")
        .setScale(2)
        .setOrigin(-0.5, -0.6)
        .play("fly");
      this.player.setDepth(2);
    }
  }

  createEasyStar() {
    this.easystar = new EasyStar.js();
    let grid = [];
    if (!this.map || !this.ground || !this.layer1) return;
    for (let i = 0; i < this.map.width; i++) {
      let col = [];
      for (let j = 0; j < this.map.height; j++) {
        if (this.ground.getTileAt(j, i) && this.layer1.getTileAt(j, i)) {
          col.push(1);
        } else col.push(0);
      }
      grid.push(col);
    }
    this.easystar.setGrid(grid);
    this.easystar.setAcceptableTiles([0]);
  }

  checkMovent(e: any) {
    let xNext = this.cameras.main.worldView.x + e.x;
    let yNext = this.cameras.main.worldView.y + e.y;

    let groundTiles = this.ground?.getTileAtWorldXY(xNext, yNext);
    let lay1Tiles = this.layer1?.getTileAtWorldXY(xNext, yNext);

    if (groundTiles && !lay1Tiles) {
      this.NEXT_PLAYER_POSITION.x = groundTiles.x;
      this.NEXT_PLAYER_POSITION.y = groundTiles.y;

      this.checkMoveInEasyStar(
        this.CURRENT_PLAYER_POSITION,
        this.NEXT_PLAYER_POSITION
      );
    }
  }

  checkMoveInEasyStar(currentPos: any, movePos: any) {
    this.easystar?.findPath(
      currentPos.x,
      currentPos.y,
      movePos.x,
      movePos.y,
      (path) => {
        if (path === null) {
          this.pathStar = null;
        } else {
          this.pathStar = path;
        }
      }
    );
    this.easystar?.calculate();
  }

  update(time: number, delta: number) {
    this.frameTime += 100;
    if (this.frameTime > 100) {
      this.frameTime = 0;
      if (this.pathStar?.length > 0) {
        const point = this.pathStar.shift();
        let pos = this.ground.getTileAt(point.x, point.y);
        //this.player.setPosition(pos.pixelX, pos.pixelY);
        this.tweens.add({
          targets: this.player,
          x: pos.pixelX,
          y: pos.pixelY,
          duration: 100,
          ease: "Linear",
        });
        this.CURRENT_PLAYER_POSITION.x = pos.x;
        this.CURRENT_PLAYER_POSITION.y = pos.y;
      }
    }
    const playerTile = this.ground?.getTileAtWorldXY(
      this.player.x + 32,
      this.player.y + 32
    );
    console.log(playerTile);

    if (!playerTile) return;

    const layer1Left = this.layer1?.getTileAt(playerTile.x - 1, playerTile.y);
    const layer1Right = this.layer1?.getTileAt(playerTile.x + 1, playerTile.y);
    const layer1Top = this.layer1?.getTileAt(playerTile.x, playerTile.y - 1);
    const layer1Bottom = this.layer1?.getTileAt(playerTile.x, playerTile.y + 1);

    if (layer1Left && layer1Top) {
      console.log("ok");
      this.player.setDepth(3);
    } else if (layer1Top && layer1Right) {
      this.player.setDepth(1);
    } else if (layer1Left && layer1Bottom) {
      this.player.setDepth(1);
    } else if (layer1Left) {
      this.player.setDepth(3);
    } else if (layer1Right) {
      this.player.setDepth(1);
    } else if (layer1Top) {
      this.player.setDepth(2);
    } else if (layer1Bottom) {
      this.player.setDepth(1);
    }
  }
  handleInputs() {
    this.input.on(Phaser.Input.Events.POINTER_UP, this.checkMovent, this);
  }
}

export default MainScene;
