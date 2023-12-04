import PreloadScene from "../game/scenes/PreloadScene";
import MainScene from "./scenes/MainScene";

function launch(containerId: string) {
  const config = {
    type: Phaser.WEBGL,
    parent: containerId,
    width: 800,
    height: 600,
    scene: [PreloadScene, MainScene],
    physics: {
      default: "arcade",
    },
  };

  return new Phaser.Game(config);
}
export default launch;
