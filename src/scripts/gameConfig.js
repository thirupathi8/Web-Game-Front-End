import Phaser from "phaser"
import GameScene from "./gameScene.js"

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [GameScene],
}

export default config