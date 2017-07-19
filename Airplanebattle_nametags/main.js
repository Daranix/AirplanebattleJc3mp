console.log(" ---------------- Nametags loaded");

jcmp.events.Add('PlayerCreated', function(player) {
  
  setTimeout(function () {
    var dsend = {
        id: player.networkId,
        name: player.escapedNametagName,
        colour: player.airplanebattle.colour
    };

    jcmp.events.CallRemote('airplanebattle_player_created', null, JSON.stringify(dsend));
  }, 200);

})

jcmp.events.Add('PlayerDestroyed', function(player) {
    jcmp.events.CallRemote('airplanebattle_player_destroyed', null, player.networkId);
});

jcmp.events.AddRemoteCallable('airplanebattle_debug', function(player, text) {
    console.log(text);
});

jcmp.events.AddRemoteCallable('airplanebattle_clientside_ready', function(player) {

    const data = {
        players: jcmp.players.map(p => ({
            id: p.networkId,
            name: p.escapedNametagName,
            colour: p.airplanebattle.colour
        }))
    };

    console.log(data);

    jcmp.events.CallRemote('airplanebattle_ready', player, JSON.stringify(data));

});
