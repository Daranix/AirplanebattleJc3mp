'use strict';

const util = require('../gm/utility');


jcmp.events.Add("PlayerCreated", player => {
    player.escapedNametagName = player.name.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 40);;
    console.log(`${player.escapedNametagName} has joined.`);
    airplanebattle.chat.broadcast(`** ${player.escapedNametagName} has joined.`, airplanebattle.config.colours.connection);

    const colour = airplanebattle.colours.randomColor();
    player.airplanebattle = {
        colour: colour,
        colour_rgb: airplanebattle.utils.hexToRGB(colour),
        kills: 0,
        deaths: 0,
        outside: 60, // time before you die if you go out of the area
        outsidetimeout: null,
        custom_time_set: false,
        ingame: false,
        warning: false,
        warningmessage: false,
        exp: 0,
        ready: false,
        game: false,
        airplanecontrol:false
    };



});

jcmp.events.Add("PlayerDestroyed", player => {
    console.log(`${player.escapedNametagName} has left.`);
    airplanebattle.chat.broadcast(`** ${player.escapedNametagName} has left.`, airplanebattle.config.colours.connection);

    if (typeof player.spawnedVehicle !== 'undefined') {
        player.spawnedVehicle.Destroy();
    }

    if(player.airplanebattle.ingame) {// if the player is ingame

      jcmp.events.Call('airplanebattle_player_leave_game', player, true);
    } else {
      airplanebattle.game.players.onlobby.removePlayer(player);
    }

jcmp.events.CallRemote("airplanebattle_player_destroyed", null, player.networkId);

});


function randomSpawn(baseVec, radius) {
    const half = radius / 2;
    return new Vector3f(baseVec.x + airplanebattle.utils.random(-half, half), baseVec.y, baseVec.z + airplanebattle.utils.random(-half, half));
}
jcmp.events.Add("PlayerReady", (player) => {
    player.escapedNametagName = player.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    //player.respawnPosition = randomSpawn(util.randomArray(spawnLocations), 900);
    player.respawnPosition = randomSpawn(airplanebattle.config.game.lobbypos, airplanebattle.config.game.lobbyRadius / 2);
    jcmp.events.CallRemote('airplanebattle_set_weather', player, airplanebattle.config.world.weather);
    airplanebattle.timeManager.updatePlayer(player);
    player.Respawn();
    player.airplanebattle.ready = true;
    airplanebattle.game.players.onlobby.push(player); // add the player to the lobby array
    console.log("Player added to lobby list");
    console.log(" * " + airplanebattle.game.players.onlobby.length + " on lobby waiting");
    if (airplanebattle.bans.has(player.client.steamId)) {
        airplanebattle.chat.send(player, 'You are banned from the server until the next server restart. You will get kicked shortly.', airplanebattle.config.colours.red);
            const done = airplanebattle.workarounds.watchPlayer(player, setTimeout(() => {
            done();
            player.Kick('banned');
        }, 15000));
    }
    const data = {
      id: player.networkId,
      name: player.escapedNametagName,
      colour: player.airplanebattle.colour,
      isAdmin: airplanebattle.utils.isAdmin(player)
  };


    console.log("Sending airplanebattle_player_created");
    console.log("Sending " + JSON.stringify(data));
    jcmp.events.CallRemote("airplanebattle_player_created", null, JSON.stringify(data));
    jcmp.events.CallRemote("airplanebattle_accueil_appear",player);



});

jcmp.events.AddRemoteCallable("airplanebattle_UI_ready", (player) => { // when UI is ready
console.log("airplanebattle_UI_ready" + player);
  jcmp.events.CallRemote('airplanebattle_UI_Hide',player);
  airplanebattle.chat.send(player, "Welcome to the Official airplanebattle server created by Daranix and Myami .", airplanebattle.config.colours.green);
  //airplanebattle.chat.send(player, "Player need before game start :" + airplanebattle.game.players.onlobby.length + "/" + airplanebattle.config.game.minPlayers, airplanebattle.config.colours.red);

  let dataneed = {
    ingame:airplanebattle.game.players.onlobby.length,
    need:airplanebattle.config.game.minPlayers
};
jcmp.events.CallRemote("airplanebattle_playerneed_client",null,JSON.stringify(dataneed));
const data = {
        players: jcmp.players.map(p => ({
            id: p.networkId,
            name: p.escapedNametagName,
            colour: p.airplanebattle.colour,
            kills: p.airplanebattle.kills,
            deaths: p.airplanebattle.deaths,
            isAdmin: airplanebattle.utils.isAdmin(p)
        }))
    };

    jcmp.events.CallRemote("airplanebattle_init", player, JSON.stringify(data));
    console.log("airplanebattle_init" + player);

});

jcmp.events.Add("PlayerDeath", (player, killer, reason,BRGame) => {
  player.airplanebattle.airplanecontrol = false;
  player.airplanebattle.ready = false;
  player.airplanebattle.deaths ++;
  let killer_data;
  let death_message = '';
  if (typeof killer !== 'undefined' && killer !== null) {
    if (killer.networkId === player.networkId) {
      death_message = 'killed themselves';
      jcmp.events.CallRemote("airplanebattle_deathui_show", player);
    } else {
      if (typeof killer.escapedNametagName !== 'undefined') {
        killer.airplanebattle.kills++;

        killer_data = {
          networkId: killer.networkId,
          kills: killer.airplanebattle.kills,
          deaths: killer.airplanebattle.deaths
        };


      jcmp.events.CallRemote("airplanebattle_kill", killer.airplanebattle.kills);

        jcmp.events.CallRemote("airplanebattle_deathui_show", player);
      } else {
        death_message = 'was squashed';
        jcmp.events.CallRemote("airplanebattle_deathui_show", player);
      }
    }
  } else {
    death_message = 'died';
    jcmp.events.CallRemote("airplanebattle_deathui_show", player);
  }
  jcmp.events.CallRemote("airplanebattle_die_client_appear", null, player.escapedNametagName);

  const data = {
      player: {
        networkId: player.networkId,
        kills: player.airplanebattle.kills,
        deaths: player.airplanebattle.deaths
      },
      killer: killer_data,
    };
    jcmp.events.CallRemote("airplanebattle_player_death", null, JSON.stringify(data));


if (player.airplanebattle.ingame){
    airplanebattle.chat.send(player, 'You will be respawned on the arena.', airplanebattle.config.colours.purple);

    let randomspawn  = player.airplanebattle.game.playerSpawnPoints[airplanebattle.utils.random(0, player.airplanebattle.game.playerSpawnPoints.length -1)]; // take a random spawn
    const pos = new Vector3f (randomspawn.x,randomspawn.y + 500,randomspawn.z);
    const done = airplanebattle.workarounds.watchPlayer(player, setTimeout(() => {
      done();
      player.respawnPosition = pos;
      player.Respawn();
      jcmp.events.CallRemote("airplanebattle_deathui_hide", player);
    }, 4000));
    player.dimension = player.airplanebattle.game.id;
    setTimeout(function() {
    console.log("dimensionplyertimeout" + player.dimension)
  }, 500)
    console.log("dimensionplayer" + player.airplanebattle.game.id + player.dimension);
    var vehicle = new Vehicle(448735752, player.position, player.rotation);
    vehicle.dimension = player.airplanebattle.game.id;
    vehicle.SetOccupant(0, player);
    setTimeout(function() {
    console.log("vehicletimeout" + vehicle.dimension)
  }, 500)
    console.log("vehicle" + vehicle.dimension);
    var airplanecontrolinterval =  setInterval(function() {
      if (!player.airplanebattle.airplanecontrol){
        vehicle.position = player.position
      }
      else {
        clearInterval(airplanecontrolinterval);
      }
    }, 1000)
}
else{
  airplanebattle.chat.send(player, 'You will be respawned in the lobby.', airplanebattle.config.colours.purple);
  const pos = airplanebattle.config.game.lobbypos;
  const done = airplanebattle.workarounds.watchPlayer(player, setTimeout(() => {
  done();
  player.respawnPosition = pos;
  player.Respawn();
  jcmp.events.CallRemote("airplanebattle_deathui_hide", player);
  }, 4000));
}



});

jcmp.events.AddRemoteCallable("airplanebattle_player_spawning", player => {
    player.invulnerable = true;
});
jcmp.events.AddRemoteCallable("airplanebattle_player_spawned", player => {
    // if the player isn't in passive mode, let them know spawn protection ends..

    airplanebattle.chat.send(player, 'Your spawn protection will end in 5 seconds.', airplanebattle.config.colours.purple);

    const done = airplanebattle.workarounds.watchPlayer(player, setTimeout(() => {
        done();
        player.invulnerable = false;
    }, 5000));
});

jcmp.events.Add('PlayerVehicleEntered', (player, vehicle, seatIndex) => {
  player.airplanebattle.airplanecontrol = true;
});
