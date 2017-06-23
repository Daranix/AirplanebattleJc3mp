'use strict';

  jcmp.events.Add('airplanebattle_updates', function() {

 // About launch the game

  if(airplanebattle.game.players.onlobby.length >= airplanebattle.config.game.minPlayers && !airplanebattle.game.toStart) {
    airplanebattle.game.toStart = true;
    airplanebattle.chat.broadcast("airplanebattle is going to start in 3 minutes");
    airplanebattle.game.StartTimer = setTimeout(function() {
      // Start a new game
      jcmp.events.Call('airplanebattle_start_battle');
    }, airplanebattle.utils.MinToMs(1)) // 3 = TIME TO START WHEN REACH THE MIN PLAYERS QUANTITY
  }

  if(airplanebattle.config.game.minPlayers > airplanebattle.game.players.onlobby.length && airplanebattle.game.toStart) {
    clearTimeout(airplanebattle.game.StartTimer);
    console.log("Game start cancelled")
    airplanebattle.game.toStart = false;
    airplanebattle.utils.broadcastToLobby("Need more players to start, the start timer was clear");
  }


// End about launch the br Game

  // For everyone on the lobby
  airplanebattle.game.players.onlobby.forEach(function(player) {


    try {

 // If they are out of area
      if(!airplanebattle.utils.IsPointInCircle(player.position, airplanebattle.config.game.lobbypos, airplanebattle.config.game.lobbyRadius) && player.airplanebattle.ready) {
    //    airplanebattle.chat.send(player, "You're not in the lobby area, returning you to the lobby area");
        player.respawnPosition = airplanebattle.utils.randomSpawn(airplanebattle.config.game.lobbypos, airplanebattle.config.game.lobbyRadius / 2);
        player.Respawn();
      } else {

      }

    } catch(ex) {
      console.log("Cant hold loop lobby");
      console.log(ex);
    }

  })

  // for everyone ingame
  airplanebattle.game.players.ingame.forEach(function(player) {





    try {
      // If they are not on the area
      if(!airplanebattle.utils.IsPointInCircle(player.position, player.airplanebattle.game.position, player.airplanebattle.game.radius) && !player.airplanebattle.warning) {

        player.airplanebattle.warning = true;



      }
// If the player is in the area remove the warning message
      if(player.airplanebattle.warning && airplanebattle.utils.IsPointInCircle(player.position, player.airplanebattle.game.position, player.airplanebattle.game.radius) || !player.airplanebattle.ingame) {
        player.airplanebattle.warning = false;
        jcmp.events.CallRemote('outarea_toggle', player, false);
        player.airplanebattle.outside = 60;
        player.airplanebattle.warningmessage = false;
        clearInterval(player.airplanebattle.outsidetimeout);

      }


    } catch(ex) {
      console.log("Can't handle loop ingame");
      console.log(ex);
    }

  })



});




jcmp.events.Add('airplanebattle_start_battle', function() {

  airplanebattle.game.gamesCount++;
  airplanebattle.game.toStart = false;


  var listname = airplanebattle.config.arenalist[airplanebattle.utils.random(0,airplanebattle.config.arenalist.length -1)];
  var areaname = airplanebattle.arena[listname].defaults.name;
  var spawnplayer = airplanebattle.arena[listname].playerSpawnPoints; // take all the player spawn
  var radius = airplanebattle.arena[listname].defaults.radius; // the default radius of the arena
  var centerposition = airplanebattle.arena[listname].defaults.center;





  var BRGame = new airplanebattle.BRGame(airplanebattle.game.gamesCount, centerposition, radius, spawnplayer ); // send everything into a class
  console.log("Creating new game with ID: " + airplanebattle.game.gamesCount + "Name of the arena: "+ areaname );


  var playersToTP = airplanebattle.game.players.onlobby; // save all the player into a new array
  airplanebattle.game.players.onlobby = []; // onlobby array make it clean
  playersToTP.forEach((p) => {
    jcmp.events.CallRemote('airplanebattle_UI_Show',p);
    jcmp.events.CallRemote("airplanebattle_distance_player_center_server", p, JSON.stringify(centerposition)); // send the center position to the client
    jcmp.events.CallRemote('airplanebattle_radius_client',p,radius); // send the radius
    jcmp.events.CallRemote('airplanebattle_playeringame_true',p);
    p.airplanebattle.game = BRGame;
    p.airplanebattle.ingame = true;
    p.dimension = BRGame.id;
    airplanebattle.game.players.ingame.push(p);
    BRGame.players.push(p);
    let randomspawn  = spawnplayer[airplanebattle.utils.random(0, spawnplayer.length -1)]; // take a random spawn
    p.position = new Vector3f (randomspawn.x,randomspawn.y + 500,randomspawn.z);
  })

  for (let i = 0; i < playersToTP.length; i++){
    const player = playersToTP[i];
      var vehicle = new Vehicle(448735752, player.position, player.rotation);
      vehicle.dimension = BRGame.id;
      vehicle.SetOccupant(0, player);

  }

  BRGame.aliveStarted = BRGame.players.length;

  BRGame.broadcast("Battle started players alive with : " + BRGame.players.length + " players", airplanebattle.config.colours.green); // need to replace by UI

  // Timer to set the area battle


  airplanebattle.game.games.push(BRGame);

  setTimeout(function() {
    // the game is X min
    jcmp.events.Call('airplanebattle_end_battle');
  }, airplanebattle.utils.MinToMs(airplanebattle.game.battleduration))
});



jcmp.events.Add('airplanebattle_end_battle', function(BRGame) // need to rewrite
{
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
  BRGame.players.forEach(function(player){
    jcmp.events.CallRemote('airplanebattle_UI_Hide',player);
    jcmp.events.CallRemote('outarea_toggle', player, false);
    jcmp.events.CallRemote('airplanebattle_playeringame_false',player);

    // Winner
  //  airplanebattle.utils.broadcastToLobby(player + " was the winner of a battle");
    jcmp.events.CallRemote('airplanebattle_winner_client_name',null,highplayerscorename);


  //  airplanebattle.chat.send(player, "You won a battle");
    jcmp.events.CallRemote('airplanebattle_winner_client_true',player);
    jcmp.events.CallRemote('airplanebattle_winner_client_true_all',null);
    setTimeout(() => {
      jcmp.events.CallRemote("airplanebattle_winner_client_false", player);
      jcmp.events.CallRemote('airplanebattle_winner_client_false_all',null);
    }, 10000);


    // Delete interval
    airplanebattle.game.players.ingame.removePlayer(player);
    player.dimension = 0;
    player.airplanebattle.kills = 0;
    player.airplanebattle.game = undefined;
    player.airplanebattle.ingame = false;
    airplanebattle.game.players.onlobby.push(player);
   })

});

jcmp.events.Add('airplanebattle_player_outarea', function() {

  airplanebattle.game.players.ingame.forEach(function(player) {
if (player.airplanebattle.warning){
          if (!player.airplanebattle.warningmessage){
              //    airplanebattle.chat.send(player, "You're not in the battle area, if u dont return to the battle area we're gonna kill u in 1 minute");// have a warning message
                  player.airplanebattle.warningmessage = true
          }

          jcmp.events.CallRemote('outarea_toggle', player, true);
          jcmp.events.CallRemote('airplanebattle_outarea_timer_client',player,player.airplanebattle.outside);
          player.airplanebattle.outside --;
          if (player.airplanebattle.outside <= 0)
          {
            player.health = 0;
          }
}

})
});

jcmp.events.Add("airplanebattle_player_leave_game", function(player, destroy) {

  // Broadcast msg to all players on that game with the current players left
  // Delete player from game the BRGame object

  player.airplanebattle.game.players.removePlayer(player);
  player.airplanebattle.ready = false;
  player.airplanebattle.ingame = false;
  jcmp.events.CallRemote('airplanebattle_UI_Hide',player);
  jcmp.events.CallRemote('outarea_toggle', player, false);
  jcmp.events.CallRemote('airplanebattle_playeringame_false',player);
  airplanebattle.game.players.ingame.removePlayer(player);
  player.dimension = 0;
  if(player.airplanebattle.game.players.length <= 1) { // if he whas the last guys ingame
    // End the battle
    console.log("Ending battle " + player.airplanebattle.game.id);
    jcmp.events.Call('airplane_end_battle', player.airplanebattle.game);
  }

  console.log("Removing player from game array players");

  console.log("Players in array: " + player.airplanebattle.game.players.length);
  if(!destroy) {
    airplanebattle.game.players.onlobby.push(player);
  }

});

 jcmp.events.Add('airplanebattle_player_vehicle', (player) => {
     var vehicle = new Vehicle(448735752, player.aimPosition, player.rotation);
     vehicle.SetOccupant(0, player);


});
