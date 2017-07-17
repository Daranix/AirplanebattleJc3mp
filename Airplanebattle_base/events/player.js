jcmp.events.Add("PlayerCreated", function(player) {

    player.escapedNametagName = player.name.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 40);
    console.log(`${player.escapedNametagName} has joined.`);

    var color = airplanebattle.utils.randomColor();
    player.airplanebattle = {
        ingame: false,
        colour: color,
        colour_rgb: airplanebattle.utils.hexToRGB(color),
        warning: false,
        airplanecontrol:false,
    vehiclesave:{},
        timers: [] // Daranix's workaround version

    }

});

jcmp.events.Add('PlayerDestroyed', function(player) {

    console.log(`${player.escapedNametagName} has left.`);

    // Daranix's workaround clearinterval / timer

    if(player.airplanebattle.timers.length >= 1) {
        for(let timer in player.airplanebattle.timers) {
            console.log(timer);
        }
    }

    if(player.airplanebattle.ingame) {
        jcmp.events.Call('airplanebattle_player_leave_game', player, true);
    } else {
        airplanebattle.game.players.onlobby.removePlayer(player);
        jcmp.events.Call('airplanebattle_update_needplayers');
    }

});

jcmp.events.Add('PlayerReady', function(player) {

    airplanebattle.game.players.onlobby.push(player); // to remove if we used the gamemodechoicepackage
    player.respawnPosition = airplanebattle.utils.randomSpawn(airplanebattle.config.game.lobby.pos, airplanebattle.config.game.lobby.radius / 2);
    player.Respawn();

    console.log("Player added to lobby list");
    console.log(" * " + airplanebattle.game.players.onlobby.length + " on lobby waiting");

    jcmp.events.Call('airplanebattle_update_needPlayers');

});

jcmp.events.Add('PlayerDeath', function(player, killer, reason) {

    if(player.airplanebattle.ingame) {
      player.airplanebattle.airplanecontrol = false;
      player.respawnPosition = player.position;
        player.Respawn();
        const v = new Vehicle(448735752, player.position, player.rotation);
        v.dimension = player.dimension;
        v.SetOccupant(0, player);
    }

    let killerName = 'the enviroment';
    if(killer != null) {
        killerName = killer.escapedNametagName;
    }

    jcmp.events.CallRemote('airplanebattle_deathui_show', player, killerName);

    airplanebattle.chat.send(player, "You die. Respawning in 5 seconds ...")

    const done = airplanebattle.workarounds.watchPlayer(player, setTimeout(() => {
        done();
        // NOTE: The death UI hides automatically
        console.log("Respawning player");
        player.Respawn();
    }, 5000));

});
jcmp.events.Add('PlayerVehicleEntered', (player, vehicle, seatIndex) => {
  player.airplanebattle.airplanecontrol = true;
});
