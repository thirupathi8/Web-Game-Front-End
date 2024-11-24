class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.otherPlayers = [];
    }

    preload() {
        this.load.image("tile1", "./assets/Nature.png");
        this.load.tilemapTiledJSON("map", "./assets/map.json");
        this.load.spritesheet("goldenMan", "./assets/character.png", {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        this.socket = io('http://localhost:3000');

        
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("Nature", "tile1");
        const groundLayer = map.createLayer("Ground", tileset, 0, 0);
        const treeLayer = map.createLayer("Trees", tileset, 0, 0);
        const tree2Layer = map.createLayer("Trees2", tileset, 0, 0);
        
        groundLayer.setCollisionByProperty({ collides: true });
        treeLayer.setCollisionByProperty({ collides: true });
        
        // Create the local player sprite
        this.player = this.physics.add.sprite(100, 100, 'goldenMan');
        this.player.setSize(12, 12);
        this.player.setCollideWorldBounds(true);
        
        // Emit initial player position to the server
        this.socket.emit('newPlayer', { x: this.player.x, y: this.player.y });
        
        // Listen for new players joining
        this.socket.on('newPlayer', (playerData) => {
            if (playerData.id !== this.socket.id) {
                let player = this.physics.add.sprite(playerData.x, playerData.y, 'goldenMan');
                player.id = playerData.id;
                this.otherPlayers.push(player);
            }
        });
        
        // Listen for all current players
        this.socket.on('currentPlayers', (existingPlayers) => {
            for (let playerId in existingPlayers) {
                let playerData = existingPlayers[playerId];
                if (playerId !== this.socket.id) { // Don't add the local player again
                    let player = this.physics.add.sprite(playerData.x, playerData.y, 'goldenMan');
                    player.id = playerData.id;
                    this.otherPlayers.push(player);
                }
            }
        });
        
        // Listen for player movement updates from the server
        this.socket.on('playerMove', (playerData) => {
            let player = this.otherPlayers.find(p => p.id === playerData.id);
            if (player) {
                player.setPosition(playerData.x, playerData.y);
            }
        });
        
        // Listen for disconnections
        this.socket.on('playerDisconnect', (playerId) => {
            const playerIndex = this.otherPlayers.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                this.otherPlayers[playerIndex].destroy();
                this.otherPlayers.splice(playerIndex, 1);
            }
        });

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers('goldenMan', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers('goldenMan', { start: 3, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setFollowOffset(0, 0);

        this.physics.add.collider(this.player, treeLayer);
        this.physics.add.collider(this.player, groundLayer);

        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    update() {
        const speed = 100;
        let moving = false;
        let x = this.player.x;
        let y = this.player.y;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            moving = true;
            x -= speed;
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "walk") {
                this.player.anims.play("walk", true);
            }
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            moving = true;
            x += speed;
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "walk") {
                this.player.anims.play("walk", true);
            }
        }
        else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            moving = true;
            y -= speed;
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "walk") {
                this.player.anims.play("walk", true);
            }
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            moving = true;
            y += speed;
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "walk") {
                this.player.anims.play("walk", true);
            }
        }
        else {
            this.player.setVelocityY(0);
        }

        if (!moving) {
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== "idle") {
                this.player.anims.play("idle", true);
            }
        }

        if (moving) {
            this.socket.emit("move", { x: this.player.x, y: this.player.y });
        }
    }
}

export default GameScene;
