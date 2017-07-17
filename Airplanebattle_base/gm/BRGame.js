'use strict';

module.exports = class BRGame {
  constructor(id, position, radius, maxY ,players) {
    this.id = id;
    this.position = position;
    this.radius = radius;
    this.players = players;
    this.aliveStarted = players.length;
    this.maxY = maxY;

  }

  start() {

    airplanebattle.game.players.onlobby = [];
    let self = this;

    let gameData = {
      center: { x: self.position.x, y: self.position.y, z: self.position.z },
      diameter: self.radius,
      maxY: self.maxY,
      npstart: this.players.length
    };

    let spawnArea = this.position;
    spawnArea.y += 1000; // More altitude

    for(let player of this.players) {

      /*jcmp.events.CallRemote('airplanebattle_txt_timerStart', player, false);
      jcmp.events.CallRemote('airplanebattle_txt_leftplayers_toggle', false);*/
      //console.log(gameData);
      jcmp.events.CallRemote('airplanebattle_client_gameStart', player, JSON.stringify(gameData));

      player.airplanebattle.game = this;
      player.airplanebattle.ingame = true;

      player.dimension = this.id;
      player.position = airplanebattle.utils.randomSpawn(spawnArea, this.radius / 1.5);
// add by myami
  var vehicle = new Vehicle(448735752, player.position, player.rotation);
    vehicle.dimension = this.id;
    vehicle.SetOccupant(0, player);
    player.airplanebattle.vehiclesave.vehicle = vehicle; // to have the vehicle health
    var airplanecontrolinterval =  setInterval(function() {
      if (!player.airplanebattle.airplanecontrol){
        vehicle.position = player.position
      }
      else {
        clearInterval(airplanecontrolinterval);
      }
    }, 1000)
    }

    //airplanebattle.game.players.ingame.push(...this.players);
    // NOTE: Concat seems to be more faster than push with the spread operator
    // REFERENCE: https://jsperf.com/array-prototype-push-apply-vs-concat/13

    airplanebattle.game.players.ingame = airplanebattle.game.players.ingame.concat(this.players);

    //console.log(airplanebattle.game.players.ingame);

    // TODO: Close more faster the area depending of the time elapsed in the game
    const time = airplanebattle.utils.MinToMs(2);
    this.closeArea = setInterval(function() {
      jcmp.events.Call('airplanebattle_end_battle', self);
    }, airplanebattle.game.battleduration);

  }

  updatePlayers() {

    let newCenter = JSON.stringify({
      x: this.position.x,
      y: this.position.y,
      z: this.position.z
    });



    for(let player of this.players) {

      jcmp.events.Call('toast_show', player, {
        heading: 'Battle update',
        text: "The new battle area has been designated",
        icon: 'Warning',
        loader: true,
        loaderBg: '#9EC600',
        position: 'top-right',
        hideAfter: 5000
      });

      jcmp.events.CallRemote('airplanebattle_render_updateDiameter', player, this.radius, newCenter);
    }

  }

  broadcast(msg, color) {
    for(let player of this.players) {
      airplanebattle.chat.send(player, msg, color);
    }
  }

  showLeftPlayers() {
    for(let player of this.players) {
      jcmp.events.CallRemote('airplanebattle_txt_gameleftplayers_show', player, this.players.length)
    }
  }


}
