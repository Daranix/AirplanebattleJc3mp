'use strict';

module.exports = class BRGame {
  constructor(id, position, radius, psp, players) {
    this.id = id;
    this.position = position;
    this.radius = radius;
    this.players = [];
    this.aliveStarted = this.players.length;
    this.playerSpawnPoints = psp;

  }

  broadcast(msg, color) {
    for(let player of this.players) {
      airplanebattle.chat.send(player, msg, color);
    }
  }


}
