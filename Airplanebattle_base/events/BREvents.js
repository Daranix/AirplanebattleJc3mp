jcmp.events.Add('airplanebattle_updates', function () {

    //console.log("Im working");

    if (airplanebattle.game.toStart) {
        airplanebattle.game.timeToStart -= 500;
    }


    if (airplanebattle.game.players.onlobby.length >= airplanebattle.config.game.minPlayers && !airplanebattle.game.toStart) {
        // Start a new interval
        airplanebattle.game.toStart = true;
        airplanebattle.utils.broadcastToLobby("The game is going to start in 2 minutes!");

        // Show and start timer and hide left players text on UI

        for (let player of airplanebattle.game.players.onlobby) {
            jcmp.events.CallRemote('airplanebattle_txt_timerStart', player, true);
            jcmp.events.CallRemote('airplanebattle_txt_leftplayers_toggle', player, false);
        }


        airplanebattle.game.timeToStart = airplanebattle.config.game.timeToStart;
        airplanebattle.game.StartTimer = setTimeout(function () {
            jcmp.events.Call('airplanebattle_start_battle');
        }, airplanebattle.config.game.timeToStart);
    }

    if (airplanebattle.game.players.onlobby.length < airplanebattle.config.game.minPlayers && airplanebattle.game.toStart) {
        // Delete timeout

        clearTimeout(airplanebattle.game.StartTimer);

        // Hide and reset timer and show left players text on UI for players on the lobby

        for (let player of airplanebattle.game.players.onlobby) {

            jcmp.events.CallRemote('airplanebattle_txt_timerStart', player, false);
            jcmp.events.CallRemote('airplanebattle_txt_leftplayers_toggle', player, true);

            jcmp.events.Call('toast_show', player, {
                heading: 'Need more players',
                text: "More players are needed to start the battle",
                icon: 'info',
                loader: true,
                loaderBg: '#9EC600',
                position: 'top-right',
                hideAfter: 5000
            });

        }

        // --

        //airplanebattle.utils.broadcastToLobby("Need more players to start the game ... ");

        airplanebattle.game.toStart = false;
        airplanebattle.game.timeToStart = airplanebattle.config.game.timeToStart;
    }

    try { // Possible errors when disconnect meanwhile is calling this

        for (let player of jcmp.players) {
            //console.log("Player on game");
            //console.log(player);

            // Update health bar
            // TODO: What is this fucking shit i write lol
            jcmp.events.CallRemote('airplanebattle_healthbar_update', player, JSON.stringify({
                health: player.health,
                maxHealth: 800
            }));

            if (player.airplanebattle.ingame) {
                // This check if the player is in the area of the game for all the players on the game
                if (!airplanebattle.utils.IsPointInCircleRender(player.position, player.airplanebattle.game.position, player.airplanebattle.game.radius)) {
                    jcmp.events.Call('airplanebattle_player_outarea', player);
                } else {

                    if (player.airplanebattle.warning) {
                        jcmp.events.Call('airplanebattle_disable_warning', player);
                    } // Player has warning end
                } // Player in area end

            } else {
                // Players on lobby
            }

        } // For loop into players

    } catch (e) {
        console.log(e);
    }


});

jcmp.events.Add('airplanebattle_start_battle', function () {

    airplanebattle.utils.broadcastToLobby("Battle starting! ... ");
    airplanebattle.game.toStart = false;
    airplanebattle.game.timeToStart = airplanebattle.config.game.timeToStart;


    const arenaIndex = airplanebattle.utils.random(0, airplanebattle.game.arenaList.length - 1);
    const battlePosition = airplanebattle.game.arenaList[arenaIndex].position;
    const maxY = airplanebattle.game.arenaList[arenaIndex].maxY;
    const battleArea_start = airplanebattle.game.arenaList[arenaIndex].radius_start;

    let BRGame = new airplanebattle.BRGame(
        airplanebattle.game.games.length + 1,
        battlePosition,
        battleArea_start,
        maxY,
        airplanebattle.game.players.onlobby
    );

    airplanebattle.game.games.push(BRGame);
    BRGame.start();

    //console.log(BRGame);
});

jcmp.events.Add('airplanebattle_update_area', function (BRGame) {


    console.log(BRGame);


    let playersInArea = BRGame.players.filter(function(p) {
        return p.airplanebattle.warning === false;
    });

    //console.log(playersInArea);
    let randomPosition;
    if(playersInArea.length >= 1) {
        const rndIndex = airplanebattle.utils.random(0, playersInArea.length - 1);
        randomPosition = playersInArea[rndIndex].position;
        console.log(randomPosition);
    } else {
       randomPosition = airplanebattle.utils.randomSpawn(BRGame.position, BRGame.radius);
    }


    BRGame.position = randomPosition;

    if (BRGame.radius / 2 >= (BRGame.radius / (2 * 5))) {
        BRGame.radius = BRGame.radius / 2;
    } else {
        clearInterval(BRGame.closeArea);
    }

    BRGame.updatePlayers();
    console.log(BRGame);

});

jcmp.events.Add('airplanebattle_end_battle', function (BRGame) {
    console.log("[airplanebattle] Battle end ID: " + BRGame.id);


    let highscore = 0;
    let highplayerscorename;
    for(var i=0; i < BRGame.players.length; i++){
        if (BRGame.players[i].kills >= highscore)
        {
          highscore = BRGame.players[i].airplanebattle.kills;
          highplayerscorename = BRGame.players[i].name;
        }
    }

      console.log("Winner is : " + highplayerscorename + " with a score of : " + highscore )

      for(var i=0; i < BRGame.players.length; i++){
        const player = BRGame.players[i];
        player.airplanebattle.ingame = false;
        if (player.airplanebattle.warning) {
            jcmp.events.Call('airplanebattle_disable_warning', player);
        }

        console.log(player.dimension);
        player.Respawn();
        player.dimension = 0;

        airplanebattle.game.players.onlobby.push(player);

        if (airplanebattle.game.toStart) {
            jcmp.events.CallRemote('airplanebattle_txt_updateTime', player, airplanebattle.game.timeToStart);
            jcmp.events.CallRemote('airplanebattle_txt_timeleft_toggle', player, true);
        } else {
            jcmp.events.CallRemote('airplanebattle_txt_leftplayers_toggle', player, true);
        }

        let needPlayers = airplanebattle.config.game.minPlayers - airplanebattle.game.players.onlobby.length;
        jcmp.events.CallRemote('airplanebattle_txt_needPlayers', player, needPlayers);
    }
      }


    clearInterval(BRGame.closeArea);

});

jcmp.events.Add('airplanebattle_player_leave_game', function (player, destroy) {

    // Destroy on TRUE = No put the player into de lobby again

    const BRGame = player.airplanebattle.game;
    BRGame.players.removePlayer(player);
    airplanebattle.game.players.ingame.removePlayer(player);

    if (BRGame.players.length <= 1) {
        jcmp.events.Call('airplanebattle_end_battle', BRGame);
    }

    if (player.airplanebattle.warning) {
        jcmp.events.Call('airplanebattle_disable_warning', player);
    }

    if (!destroy) {
        jcmp.events.CallRemote('airplanebattle_client_gameEnd', player);
        airplanebattle.game.players.onlobby.push(player);
        player.airplanebattle.ingame = false;
        player.dimension = 0;

        const done = airplanebattle.workarounds.watchPlayer(player, setTimeout(() => {
            done();
            // NOTE: Maybe include here the update needPlayers update event and the lobby push
            player.Respawn();
        }, 5000));

        airplanebattle.utils.showLobbyUI(player);
        jcmp.events.Call('airplanebattle_update_needPlayers');
    }

    BRGame.showLeftPlayers();

});

jcmp.events.Add('airplanebattle_player_outarea', function (player) {

    // TODO: Show warning to the player on UI

    if (!player.airplanebattle.warning) { // If the played wasn't warned on a first time

        jcmp.events.CallRemote('airplanebattle_render_setColor', player, 'red');

        player.airplanebattle.warning = true;
        airplanebattle.chat.send(player, "Return to the battle zone, if you do not return in 60 seconds you will be considered a deserter!");



        player.airplanebattle.warningTS = airplanebattle.workarounds2.createTimeout(player, function () {
            player.airplanebattle.warningINTV = airplanebattle.workarounds2.createInterval(player, function () {
                console.log("Player loosing HP");
                player.health -= 20;
            }, 1000);
        }, 60000);
    }

});

jcmp.events.Add('airplanebattle_disable_warning', function (player) {

    // TODO: Disable warning for the player from UI

    console.log("Player returned to the area!!!!!!!!!!!!!!!!")
    jcmp.events.CallRemote('airplanebattle_render_setColor', player, 'white');
    player.airplanebattle.warning = false;

    // Timeout

    if (player.airplanebattle.warningTS != null) {
        //clearTimeout(player.airplanebattle.warningTS);
        airplanebattle.workarounds2.deleteTimer(player, player.airplanebattle.warningTS)
        player.airplanebattle.warningTS = null;
    }

    // Interval

    if (player.airplanebattle.warningINTV != null) {
        airplanebattle.workarounds2.deleteTimer(player, player.airplanebattle.warningINTV);
        player.airplanebattle.warningINTV = null;
    }

});

jcmp.events.Add('airplanebattle_update_needPlayers', function () {
    let needPlayers = airplanebattle.config.game.minPlayers - airplanebattle.game.players.onlobby.length;
    jcmp.events.CallRemote('airplanebattle_txt_needPlayers', null, needPlayers);
});

jcmp.events.AddRemoteCallable('airplanebattle_txt_ready', function (player) {

    if (airplanebattle.game.toStart) {
        jcmp.events.CallRemote('airplanebattle_txt_updateTime', player, airplanebattle.game.timeToStart);
        jcmp.events.CallRemote('airplanebattle_txt_timerStart', player, true);
    } else {
        jcmp.events.CallRemote('airplanebattle_txt_leftplayers_toggle', player, true);
    }

    let needPlayers = airplanebattle.config.game.minPlayers - airplanebattle.game.players.onlobby.length;
    jcmp.events.CallRemote('airplanebattle_txt_needPlayers', player, needPlayers);
});
