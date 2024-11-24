import GameScene from "./gameScene.js"

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    backgroundColor: "#333333",
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                y: 0
            }
        }
    },
    parent: "thegame",
    scene: [GameScene]
}

const game = new Phaser.Game(config)