'use strict';

  jcmp.events.Add('battleroyale_updates', function() {

 // About launch the game

  if(battleroyale.game.players.onlobby.length >= battleroyale.config.game.minPlayers && !battleroyale.game.toStart) {
    battleroyale.game.toStart = true;
    battleroyale.chat.broadcast("battleroyale is going to start in 3 minutes");
    battleroyale.game.StartTimer = setTimeout(function() {
      // Start a new game
      jcmp.events.Call('battleroyale_start_battle');
    }, battleroyale.utils.MinToMs(1)) // 3 = TIME TO START WHEN REACH THE MIN PLAYERS QUANTITY
  }

  if(battleroyale.config.game.minPlayers > battleroyale.game.players.onlobby.length && battleroyale.game.toStart) {
    clearTimeout(battleroyale.game.StartTimer);
    console.log("Game start cancelled")
    battleroyale.game.toStart = false;
    battleroyale.utils.broadcastToLobby("Need more players to start, the start timer was clear");
  }


// End about launch the br Game

  // For everyone on the lobby
  battleroyale.game.players.onlobby.forEach(function(player) {


    try {

 // If they are out of area
      if(!battleroyale.utils.IsPointInCircle(player.position, battleroyale.config.game.lobbypos, battleroyale.config.game.lobbyRadius) && player.battleroyale.ready) {
    //    battleroyale.chat.send(player, "You're not in the lobby area, returning you to the lobby area");
        player.respawnPosition = battleroyale.utils.randomSpawn(battleroyale.config.game.lobbypos, battleroyale.config.game.lobbyRadius / 2);
        player.Respawn();
      } else {

      }

    } catch(ex) {
      console.log("Cant hold loop");
      console.log(ex);
    }

  })

  // for everyone ingame
  battleroyale.game.players.ingame.forEach(function(player) {





    try {
      // If they are not on the area
      if(!battleroyale.utils.IsPointInCircle(player.position, player.battleroyale.game.position, player.battleroyale.game.radius) && !player.battleroyale.warning) {

        player.battleroyale.warning = true;



      }
// If the player is in the area remove the warning message
      if(player.battleroyale.warning && battleroyale.utils.IsPointInCircle(player.position, player.battleroyale.game.position, player.battleroyale.game.radius) || !player.battleroyale.ingame) {
        player.battleroyale.warning = false;
        jcmp.events.CallRemote('outarea_toggle', player, false);
        player.battleroyale.outside = 60;
        player.battleroyale.warningmessage = false;
        clearInterval(player.battleroyale.outsidetimeout);

      }


    } catch(ex) {
      console.log("Can't handle loop");
      console.log(ex);
    }

  })



});




jcmp.events.Add('battleroyale_start_battle', function() {

  battleroyale.game.gamesCount++;
  battleroyale.game.toStart = false;


  var listname = battleroyale.config.arenalist[battleroyale.utils.random(0,battleroyale.config.arenalist.length -1)];
  var areaname = battleroyale.arena[listname].defaults.name;
  var spawnplayer = battleroyale.arena[listname].playerSpawnPoints; // take all the player spawn
  var spawnwbarrel = battleroyale.arena[listname].barrelSpawnPoints; //all the weapon spawn
  var radius = battleroyale.arena[listname].defaults.radius; // the default radius of the arena
  var centerposition = battleroyale.arena[listname].defaults.center;




  console.log("Center position X: " + battleroyale.arena[listname].defaults.center.x + " Y: " + battleroyale.arena[listname].defaults.center.y + " Z: " + battleroyale.arena[listname].defaults.center.z);

  console.log(battleroyale.game.players.onlobby.length);

  var BRGame = new battleroyale.BRGame(battleroyale.game.gamesCount, centerposition, radius, spawnplayer, spawnwbarrel); // send everything into a class
  console.log("Creating new game with ID: " + battleroyale.game.gamesCount + "Name of the arena: "+ areaname );


  var playersToTP = battleroyale.game.players.onlobby; // save all the player into a new array
  battleroyale.game.players.onlobby = []; // onlobby array make it clean
  playersToTP.forEach(function(p) {
    jcmp.events.CallRemote("battleroyale_Brgame_client", p, JSON.stringify(BRGame.barrelSpawnPoints),BRGame.id); // send the weapon position to the client
    jcmp.events.CallRemote('battleroyale_UI_Show',p);
    jcmp.events.CallRemote("battleroyale_distance_player_center_server", p, JSON.stringify(centerposition)); // send the center position to the client
    jcmp.events.CallRemote('battleroyale_radius_client',p,radius); // send the radius
    jcmp.events.CallRemote('battleroyale_playeringame_true',p);
    p.battleroyale.game = BRGame;
    p.battleroyale.ingame = true;
    p.dimension = BRGame.id;
    p.health = 800;
    battleroyale.game.players.ingame.push(p);
    BRGame.players.push(p);
    let randomspawn  = spawnplayer[battleroyale.utils.random(0, spawnplayer.length -1)]; // take a random spawn
    p.position = new Vector3f (randomspawn.x,randomspawn.y + 700,randomspawn.z);
    p.weapons.forEach(function(weapon){
       p.RemoveWeapon(weapon.modelHash);
     })
     var vehicle = new Vehicle(448735752, p.position, p.rotation); //Spawn the vehicle at the players position  CARMEN ALBATROSS REBEL
     vehicle.SetOccupant(0, p); //Assign the player to the driver seat
  })

  BRGame.aliveStarted = BRGame.players.length;

  BRGame.broadcast("Battle started players alive with : " + BRGame.players.length + " players", battleroyale.config.colours.green); // need to replace by UI

  // Timer to set the area battle


  battleroyale.game.games.push(BRGame);

  setTimeout(function() {
    // the game is X min
    jcmp.events.Call('battleroyale_end_battle');
  }, battleroyale.utils.MinToMs(battleroyale.game.battleduration))
});



jcmp.events.Add('battleroyale_end_battle', function(BRGame) // need to rewrite
{
let highscore = 0;
let highplayerscorename;
for(var i=0; i < BRGame.players.length; i++){
    if (BRGame.players[i].kills >= highscore)
    {
      highscore = BRGame.players[i].battleroyale.kills;
      highplayerscorename = BRGame.players[i].name;
    }
}

  console.log("Winner is : " + highplayerscorename + " with a score of : " + highscore )
  BRGame.players.forEach(function(player){
    jcmp.events.CallRemote('battleroyale_UI_Hide',player);
    jcmp.events.CallRemote('outarea_toggle', player, false);
    jcmp.events.CallRemote('battleroyale_playeringame_false',player);
    jcmp.events.CallRemote('battleroyale_POI_Delete',player);

    // Winner
  //  battleroyale.utils.broadcastToLobby(player + " was the winner of a battle");
    jcmp.events.CallRemote('battleroyale_winner_client_name',null,highplayerscorename);


  //  battleroyale.chat.send(player, "You won a battle");
    jcmp.events.CallRemote('battleroyale_winner_client_true',player);
    jcmp.events.CallRemote('battleroyale_winner_client_true_all',null);
    setTimeout(() => {
      jcmp.events.CallRemote("battleroyale_winner_client_false", player);
      jcmp.events.CallRemote('battleroyale_winner_client_false_all',null);
    }, 10000);


    // Delete interval
    battleroyale.game.players.ingame.removePlayer(player);
    player.dimension = 0;
    player.battleroyale.kills = 0;
    player.battleroyale.game = undefined;
    player.battleroyale.ingame = false;
    battleroyale.game.players.onlobby.push(player);
   })

});

jcmp.events.Add('battleroyale_player_outarea', function() {

  battleroyale.game.players.ingame.forEach(function(player) {
if (player.battleroyale.warning){
          if (!player.battleroyale.warningmessage){
              //    battleroyale.chat.send(player, "You're not in the battle area, if u dont return to the battle area we're gonna kill u in 1 minute");// have a warning message
                  player.battleroyale.warningmessage = true
          }

          jcmp.events.CallRemote('outarea_toggle', player, true);
          jcmp.events.CallRemote('battleroyale_outarea_timer_client',player,player.battleroyale.outside);
          player.battleroyale.outside --;
          if (player.battleroyale.outside <= 0)
          {
            player.health = 0;
          }
}

})
});
