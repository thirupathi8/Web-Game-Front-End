import React, { useEffect } from "react"
import Phaser from "phaser"
import gameConfig from "../scripts/gameConfig.js"

const Game = ({ isLoggedIn }) => {
    useEffect(() => {
        if (!isLoggedIn) return

        const game = new Phaser.Game(gameConfig)
        return () => {
            game.destroy(true)
        }
    }, [isLoggedIn])

    return <div id="game-container" />
}

export default Game