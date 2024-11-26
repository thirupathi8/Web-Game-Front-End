import Phaser from "phaser"
import { io } from "socket.io-client"

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene")
        this.otherPlayers = []
        this.socket = null
        this.player = null
    }

    preload() {
        this.load.image("tile1", "src\\assets\\Nature.png")
        this.load.tilemapTiledJSON("map", "src\\assets\\map.json")
        this.load.spritesheet("goldenMan", "src\\assets\\character.png", {
            frameWidth: 32,
            frameHeight: 32,
        })
    }

    create() {
        this.socket = io("http://localhost:3000")

        const map = this.make.tilemap({ key: "map" })
        const tileset = map.addTilesetImage("Nature", "tile1")
        const groundLayer = map.createLayer("Ground", tileset, 0, 0)
        const treeLayer = map.createLayer("Trees", tileset, 0, 0)
        const tree2Layer = map.createLayer("Trees2", tileset, 0, 0)

        groundLayer.setCollisionByProperty({ collides: true })
        treeLayer.setCollisionByProperty({ collides: true })

        this.player = this.physics.add.sprite(100, 100, "goldenMan")
        this.player.setSize(12, 12)
        this.player.setCollideWorldBounds(true)

        // this.socket.on("connect", () => {
        //     console.log("Connected to server with ID:", this.socket.id)
        // })

        this.socket.emit("newPlayer", { playerId: this.socket.id, x: this.player.x, y: this.player.y })

        this.socket.on("newPlayer", (playerData) => {
            if (playerData.id !== this.socket.id) {
                let player = this.physics.add.sprite(playerData.x, playerData.y, "goldenMan")
                player.id = playerData.id
                this.otherPlayers.push(player)
            }
        })

        this.socket.on("currentPlayers", (existingPlayers) => {
            // console.log("Received players:", existingPlayers)
            this.otherPlayers = []
            for (let playerId in existingPlayers) {
                let playerData = existingPlayers[playerId]
                if (playerId !== this.socket.id) {
                    let player = this.physics.add.sprite(playerData.x, playerData.y, "goldenMan")
                    player.id = playerId
                    this.otherPlayers.push(player)
                    // console.log(`Added player ${playerId} at x: ${playerData.x}, y: ${playerData.y}`)
                }
            }
        })

        this.socket.on("playerMove", (playerData) => {
            // console.log("Current otherPlayers array:", this.otherPlayers.map(p => ({ id: p.id, x: p.x, y: p.y })))
            // console.log("Received playerData:", playerData)
            let player = this.otherPlayers.find((p) => p.id === playerData.id)
            if (!player) {
                console.warn(`Player with id ${playerData.id} not found in otherPlayers.`)
                return
            }
            player.setPosition(playerData.x, playerData.y)
            // console.log(`Updated the position of ${playerData.id} to x: ${playerData.x} and y: ${playerData.y}`)
        })
        

        this.socket.on("playerDisconnect", (playerId) => {
            // console.log("Disconnect event received for player:", playerId)
            const playerIndex = this.otherPlayers.findIndex((p) => p.id === playerId)
            if (playerIndex !== -1) {
                console.log(`Removing player ${playerId}`)
                this.otherPlayers[playerIndex].destroy()
                this.otherPlayers.splice(playerIndex, 1)
            } else {
                // console.warn(`Player with id ${playerId} not found in otherPlayers.`)
            }
        })

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("goldenMan", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1,
        })

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("goldenMan", { start: 3, end: 7 }),
            frameRate: 10,
            repeat: -1,
        })

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.startFollow(this.player)
        this.cameras.main.setFollowOffset(0, 0)

        this.physics.add.collider(this.player, treeLayer)
        this.physics.add.collider(this.player, groundLayer)

        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        })
    }

    update() {
        const speed = 100
        let moving = false

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed)
            this.player.anims.play("walk")
            moving = true
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed)
            this.player.anims.play("walk")
            moving = true
        } else {
            this.player.setVelocityX(0)
            this.player.anims.play("idle")
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed)
            this.player.anims.play("walk")
            moving = true
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed)
            this.player.anims.play("walk")
            moving = true
        } else {
            this.player.setVelocityY(0)
            this.player.anims.play("idle")
        }

        if (moving) {
            this.socket.emit("move", { id: this.socket.id, x: this.player.x, y: this.player.y })
            // console.log("Move event emitted", { x: this.player.x, y: this.player.y })
        }
    }
}

export default GameScene
